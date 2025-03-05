
// Core extraction functionality for metrics from text
import { metricSchema } from './extractors.ts';
import { cleanText, normalizeNumber } from './data-cleaning.ts';

/**
 * Extract metrics from analysis text
 * @param text The raw text to extract metrics from
 * @returns Extracted metrics record
 */
export function extractMetrics(text: string): Record<string, any> {
  const cleanedText = cleanText(text);
  const result: Record<string, number | null> = {};
  
  console.log("Extracting metrics from cleaned text...");
  
  // Extract each metric with primary and alias patterns
  for (const [metricKey, metricConfig] of Object.entries(metricSchema)) {
    let found = false;
    
    // Try all patterns for this metric
    for (const pattern of metricConfig.patterns) {
      const match = cleanedText.match(pattern);
      if (match && match[1]) {
        const value = normalizeNumber(match[1], metricConfig.unit);
        if (!isNaN(value)) {
          result[metricKey] = value;
          found = true;
          console.log(`Extracted ${metricKey}: ${value} from pattern ${pattern}`);
          break;
        }
      }
    }
    
    // If not found, try aliases
    if (!found && metricConfig.aliases && metricConfig.aliases.length > 0) {
      for (const alias of metricConfig.aliases) {
        const aliasPatterns = [
          new RegExp(`${alias}[:\\s]+([0-9,.]+[kmb]?)`, 'i'),
          new RegExp(`([0-9,.]+[kmb]?)[\\s]*${alias}`, 'i'),
          new RegExp(`${alias}\\s*\\n?\\s*([0-9,.]+[kmb]?)`, 'i')
        ];
        
        for (const pattern of aliasPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            const value = normalizeNumber(match[1], metricConfig.unit);
            if (!isNaN(value)) {
              result[metricKey] = value;
              found = true;
              console.log(`Extracted ${metricKey} from alias ${alias}: ${value}`);
              break;
            }
          }
        }
        if (found) break;
      }
    }
    
    // If still not found, set to null (will be calculated later if possible)
    if (!found) {
      result[metricKey] = null;
      console.log(`No value found for ${metricKey}`);
    }
  }
  
  // After initial extraction, try to calculate missing values
  calculateMissingMetrics(result);
  
  return result;
}

/**
 * Calculate missing metrics based on existing values
 * @param metrics The current metrics record
 */
export function calculateMissingMetrics(metrics: Record<string, number | null>): void {
  console.log("Calculating missing metrics...");
  
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
}
