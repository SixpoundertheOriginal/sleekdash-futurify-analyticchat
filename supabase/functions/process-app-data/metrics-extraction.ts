// Core extraction functionality for metrics from text
import { metricSchema } from './extractors.ts';
import { cleanText, normalizeNumber, preprocessAnalyticsText } from './data-cleaning.ts';
import { validateMetricValue } from './validation.ts';

/**
 * Extract metrics from analysis text
 * @param text The raw text to extract metrics from
 * @returns Extracted metrics record with confidence scores
 */
export function extractMetrics(text: string): Record<string, any> {
  if (!text || typeof text !== 'string') {
    console.error("Invalid input to extractMetrics: not a string or empty");
    return { _extraction: { error: "Invalid input" } };
  }
  
  // First, preprocess the text for better extraction
  const preprocessedText = preprocessAnalyticsText(text);
  
  // Then clean the text for extraction
  const cleanedText = cleanText(preprocessedText);
  
  if (!cleanedText) {
    console.error("Cleaning resulted in empty text");
    return { _extraction: { error: "Cleaning resulted in empty text" } };
  }
  
  const result: Record<string, any> = {};
  const confidenceScores: Record<string, number> = {};
  const extractedValues: Record<string, number | null> = {};
  const warnings: Record<string, string[]> = {};
  
  console.log("Extracting metrics from cleaned text...");
  
  // Extract each metric with primary and alias patterns
  for (const [metricKey, metricConfig] of Object.entries(metricSchema)) {
    let found = false;
    let extractedValue: number | null = null;
    let patternConfidence = 0;
    
    // Try all patterns for this metric
    for (const pattern of metricConfig.patterns) {
      const match = cleanedText.match(pattern);
      if (match && match[1]) {
        extractedValue = normalizeNumber(match[1], metricConfig.unit);
        if (!isNaN(extractedValue)) {
          extractedValues[metricKey] = extractedValue;
          // Primary patterns get higher confidence
          patternConfidence = 75;
          found = true;
          console.log(`Extracted ${metricKey}: ${extractedValue} from primary pattern ${pattern}`);
          break;
        }
      }
    }
    
    // If not found, try aliases (lower confidence)
    if (!found && metricConfig.aliases && metricConfig.aliases.length > 0) {
      for (const alias of metricConfig.aliases) {
        const aliasPatterns = [
          new RegExp(`${alias}[:\\s]+([0-9,.KMBkmb]+)`, 'i'),
          new RegExp(`([0-9,.KMBkmb]+)[\\s]*${alias}`, 'i'),
          new RegExp(`${alias}\\s*\\n?\\s*([0-9,.KMBkmb]+)`, 'i')
        ];
        
        for (const pattern of aliasPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            extractedValue = normalizeNumber(match[1], metricConfig.unit);
            if (!isNaN(extractedValue)) {
              extractedValues[metricKey] = extractedValue;
              // Alias patterns get lower confidence
              patternConfidence = 60;
              found = true;
              console.log(`Extracted ${metricKey} from alias ${alias}: ${extractedValue}`);
              break;
            }
          }
        }
        if (found) break;
      }
    }
    
    // If still not found, set to null (will be calculated later if possible)
    if (!found) {
      extractedValues[metricKey] = null;
      console.log(`No value found for ${metricKey}`);
    } else {
      // Validate the extracted value against expected ranges
      const validation = validateMetricValue(metricKey, extractedValue as number);
      
      // Store warnings
      if (validation.warnings.length > 0) {
        warnings[metricKey] = validation.warnings;
      }
      
      // Final confidence is average of pattern confidence and value validation confidence
      confidenceScores[metricKey] = Math.round((patternConfidence + validation.confidence) / 2);
      
      // Store the value with metadata
      result[metricKey] = {
        value: extractedValue,
        confidence: confidenceScores[metricKey],
        warnings: validation.warnings,
        extracted: true,
        calculated: false
      };
    }
  }
  
  // After initial extraction, try to calculate missing values
  const calculatedMetrics = calculateMissingMetrics(extractedValues, result, warnings);
  
  // Combine extracted and calculated results
  const finalResult = { ...result, ...calculatedMetrics };
  
  // Add overall extraction quality metrics
  const overallConfidence = calculateOverallConfidence(finalResult);
  finalResult._extraction = {
    timestamp: Date.now(),
    overallConfidence,
    missingRequiredMetrics: getMissingRequiredMetrics(extractedValues),
    validationWarnings: Object.values(warnings).flat(),
    inconsistentRelationships: findInconsistentRelationships(finalResult)
  };
  
  return finalResult;
}

/**
 * Calculate missing metrics based on existing values
 * @param metrics The current metrics record
 * @param result Object to store results with metadata
 * @param warnings Object to store validation warnings
 * @returns Calculated metrics with metadata
 */
export function calculateMissingMetrics(
  metrics: Record<string, number | null>,
  result: Record<string, any>,
  warnings: Record<string, string[]>
): Record<string, any> {
  console.log("Calculating missing metrics...");
  
  const calculatedResults: Record<string, any> = {};
  let calculatedAtLeastOne = true;
  const maxIterations = 3; // Prevent infinite loops
  let iterations = 0;
  
  // Iteratively try to fill in missing metrics
  while (calculatedAtLeastOne && iterations < maxIterations) {
    calculatedAtLeastOne = false;
    iterations++;
    
    for (const [metricKey, metricConfig] of Object.entries(metricSchema)) {
      // Skip if already calculated or no calculation method available
      if (metrics[metricKey] !== null || !metricConfig.calculateFrom) continue;
      
      const { inputs, formula } = metricConfig.calculateFrom;
      const inputValues = inputs.map(input => metrics[input as keyof typeof metrics] as number | null);
      
      // Check if all required inputs are available
      if (!inputValues.includes(null)) {
        try {
          // Apply the formula to calculate the missing metric
          const calculatedValue = formula(...inputValues as number[]);
          if (calculatedValue !== null && !isNaN(calculatedValue)) {
            metrics[metricKey] = calculatedValue;
            
            // Validate the calculated value
            const validation = validateMetricValue(
              metricKey, 
              calculatedValue, 
              inputs.reduce((map, key, index) => {
                map[key] = inputValues[index] as number;
                return map;
              }, {} as Record<string, number>)
            );
            
            // Store the calculated value with metadata
            calculatedResults[metricKey] = {
              value: calculatedValue,
              confidence: validation.confidence * 0.8, // Lower confidence for calculated values
              warnings: validation.warnings,
              extracted: false,
              calculated: true,
              calculatedFrom: inputs
            };
            
            // Store warnings
            if (validation.warnings.length > 0) {
              warnings[metricKey] = validation.warnings;
            }
            
            calculatedAtLeastOne = true;
            console.log(`Calculated missing ${metricKey}: ${calculatedValue} from ${inputs.join(', ')}`);
          }
        } catch (error) {
          console.error(`Error calculating ${metricKey}:`, error);
        }
      }
    }
  }
  
  console.log("Finished calculating missing metrics after", iterations, "iterations");
  return calculatedResults;
}

/**
 * Calculate overall confidence score for the extraction
 * @param results Extraction results with confidence scores
 * @returns Overall confidence percentage
 */
function calculateOverallConfidence(results: Record<string, any>): number {
  const confidenceValues: number[] = [];
  const keyMetrics = ['downloads', 'proceeds', 'conversionRate', 'impressions'];
  
  // Get confidence scores for all metrics, weighing key metrics more heavily
  for (const [key, data] of Object.entries(results)) {
    if (key.startsWith('_') || typeof data !== 'object' || !('confidence' in data)) continue;
    
    const isKeyMetric = keyMetrics.includes(key);
    const weight = isKeyMetric ? 2 : 1;
    
    for (let i = 0; i < weight; i++) {
      confidenceValues.push(data.confidence);
    }
  }
  
  // If no confidence values, return 0
  if (confidenceValues.length === 0) return 0;
  
  // Calculate weighted average
  const avgConfidence = confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length;
  return Math.round(avgConfidence);
}

/**
 * Get list of missing required metrics
 * @param metrics Extracted metrics
 * @returns Array of missing required metric names
 */
function getMissingRequiredMetrics(metrics: Record<string, number | null>): string[] {
  const requiredMetrics = ['downloads', 'proceeds', 'conversionRate', 'impressions'];
  return requiredMetrics.filter(key => metrics[key] === null);
}

/**
 * Find inconsistent relationships between metrics
 * @param results Extraction results
 * @returns Array of inconsistency descriptions
 */
function findInconsistentRelationships(results: Record<string, any>): string[] {
  const inconsistencies: string[] = [];
  
  // Check if page views > impressions
  if (results.pageViews?.value > 0 && results.impressions?.value > 0) {
    if (results.pageViews.value > results.impressions.value) {
      inconsistencies.push('Page views exceed impressions');
    }
  }
  
  // Check downloads vs impressions * conversion rate
  if (results.downloads?.value > 0 && results.impressions?.value > 0 && results.conversionRate?.value > 0) {
    const expectedDownloads = results.impressions.value * (results.conversionRate.value / 100);
    const ratio = results.downloads.value / expectedDownloads;
    
    if (ratio < 0.5 || ratio > 2.0) {
      inconsistencies.push(`Downloads inconsistent with impressions * conversion rate`);
    }
  }
  
  // Check retention decreasing over time
  const retentionKeys = ['day1Retention', 'day7Retention', 'day14Retention', 'day28Retention'];
  for (let i = 0; i < retentionKeys.length - 1; i++) {
    const current = results[retentionKeys[i]]?.value;
    const next = results[retentionKeys[i+1]]?.value;
    
    if (current !== undefined && next !== undefined && current < next) {
      inconsistencies.push(`${retentionKeys[i+1]} higher than ${retentionKeys[i]}`);
    }
  }
  
  return inconsistencies;
}
