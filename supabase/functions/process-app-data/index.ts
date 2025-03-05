
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Define metric schema for structured parsing
const metricSchema = {
  impressions: {
    patterns: [/impressions[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*impressions/i],
    aliases: ['views', 'app views', 'product views'],
    unit: 'count',
    calculateFrom: {
      inputs: ['pageViews', 'conversionRate'],
      formula: (pageViews, conversionRate) => pageViews / (conversionRate / 100)
    }
  },
  pageViews: {
    patterns: [/page views[:\s]+([0-9,.]+)/i, /product page views[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*page views/i],
    aliases: ['product views', 'listing views', 'store views'],
    unit: 'count',
    calculateFrom: {
      inputs: ['impressions', 'conversionRate'],
      formula: (impressions, conversionRate) => impressions * (conversionRate / 100)
    }
  },
  downloads: {
    patterns: [/downloads[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*downloads/i, /total downloads[:\s]+([0-9,.]+)/i],
    aliases: ['installs', 'app installs', 'total installs'],
    unit: 'count',
    calculateFrom: {
      inputs: ['pageViews', 'conversionRate'],
      formula: (pageViews, conversionRate) => pageViews * (conversionRate / 100)
    }
  },
  conversionRate: {
    patterns: [/conversion rate[:\s]+([0-9,.]+)%/i, /([0-9,.]+)%[\s]*conversion/i],
    aliases: ['conv rate', 'cvr', 'conversion percentage'],
    unit: 'percentage',
    calculateFrom: {
      inputs: ['downloads', 'pageViews'],
      formula: (downloads, pageViews) => pageViews > 0 ? (downloads / pageViews) * 100 : null
    }
  },
  proceeds: {
    patterns: [/proceeds[:\s]*\$?([0-9,.]+)/i, /revenue[:\s]*\$?([0-9,.]+)/i, /\$([0-9,.]+)[\s]*proceeds/i],
    aliases: ['revenue', 'sales', 'income'],
    unit: 'currency',
    calculateFrom: {
      inputs: ['downloads', 'arpu'],
      formula: (downloads, arpu) => downloads * arpu
    }
  },
  crashes: {
    patterns: [/crashes?[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*crashes/i, /crash count[:\s]+([0-9,.]+)/i],
    aliases: ['app crashes', 'error count', 'failures'],
    unit: 'count',
    calculateFrom: null
  }
};

// Change patterns for percent changes
const changeSchema = {
  impressionsChange: {
    patternTypes: [
      { pattern: /impressions.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /impressions.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 }
    ],
    baseMetric: 'impressions'
  },
  pageViewsChange: {
    patternTypes: [
      { pattern: /page views.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /page views.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 }
    ],
    baseMetric: 'pageViews'
  },
  downloadsChange: {
    patternTypes: [
      { pattern: /downloads.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /downloads.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 }
    ],
    baseMetric: 'downloads'
  },
  conversionRateChange: {
    patternTypes: [
      { pattern: /conversion rate.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /conversion.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 }
    ],
    baseMetric: 'conversionRate'
  },
  proceedsChange: {
    patternTypes: [
      { pattern: /proceeds.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /revenue.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /proceeds.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 }
    ],
    baseMetric: 'proceeds'
  },
  crashesChange: {
    patternTypes: [
      { pattern: /crashes.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /crashes.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 }
    ],
    baseMetric: 'crashes'
  }
};

// Structured pattern recognition with fallbacks
function cleanText(text: string): string {
  // Remove special characters but keep commas and periods for numbers
  let cleaned = text
    .replace(/[^\w\s.,:%$+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  console.log("Cleaned text:", cleaned);
  return cleaned;
}

// Enhanced normalization with unit awareness
function normalizeNumber(numStr: string, unit: string = 'count'): number {
  if (!numStr) return NaN;
  
  // Remove commas and other formatting
  let normalized = numStr.replace(/,/g, "").trim();
  
  // Handle K/M/B suffix for thousands/millions/billions
  if (/[kmb]$/i.test(normalized)) {
    const multiplier = normalized.slice(-1).toLowerCase() === 'k' ? 1000 : 
                       normalized.slice(-1).toLowerCase() === 'm' ? 1000000 : 
                       1000000000;
    normalized = normalized.slice(0, -1).trim();
    return parseFloat(normalized) * multiplier;
  }
  
  // Handle currency symbols
  if (unit === 'currency') {
    normalized = normalized.replace(/^\$/, "");
  }
  
  // Handle percentage
  if (unit === 'percentage' && normalized.endsWith('%')) {
    normalized = normalized.slice(0, -1);
  }
  
  return parseFloat(normalized);
}

// Extract metrics with pattern matching and fallbacks
function extractMetrics(text: string): Record<string, number | null> {
  const cleanedText = cleanText(text);
  const result: Record<string, number | null> = {};
  
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
          new RegExp(`${alias}[:\\s]+([0-9,.]+)`, 'i'),
          new RegExp(`([0-9,.]+)[\\s]*${alias}`, 'i')
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
    }
  }
  
  // After initial extraction, try to calculate missing values
  calculateMissingMetrics(result);
  
  return result;
}

// Calculate missing metrics based on relationships
function calculateMissingMetrics(metrics: Record<string, number | null>): void {
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
      const inputValues = inputs.map(input => metrics[input]);
      
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
}

// Enhanced change percentage extraction with directional awareness
function extractChangePercentages(text: string): Record<string, number | null> {
  const cleanedText = cleanText(text);
  const result: Record<string, number | null> = {};
  
  for (const [changeKey, changeConfig] of Object.entries(changeSchema)) {
    let found = false;
    
    for (const patternType of changeConfig.patternTypes) {
      const match = cleanedText.match(patternType.pattern);
      
      if (match) {
        // Extract direction and value
        const directionText = match[patternType.directionGroup];
        const valueText = match[patternType.valueGroup];
        
        if (valueText) {
          let value = parseFloat(valueText);
          
          // Handle direction
          const isNegative = directionText && 
             (directionText.toLowerCase().includes('decrease') || 
              directionText.toLowerCase().includes('decreased'));
          
          if (isNegative) {
            value = -value;
          }
          
          result[changeKey] = value;
          found = true;
          console.log(`Extracted ${changeKey}: ${value} (${isNegative ? 'negative' : 'positive'})`);
          break;
        }
      }
    }
    
    // If not found, set to null
    if (!found) {
      result[changeKey] = null;
    }
  }
  
  return result;
}

// Validate extracted data with heuristics
function validateData(metrics: Record<string, number | null>, changes: Record<string, number | null>): { 
  isValid: boolean; 
  missingFields: string[];
  confidence: number;
  estimatedFields: string[];
} {
  const missingFields = Object.entries(metrics)
    .filter(([_, value]) => value === null)
    .map(([key, _]) => key);
  
  const estimatedFields = [];
  
  // Consider data valid if we have at least 3 KPIs with at least 1 from each major category
  const hasAcquisitionMetric = metrics.impressions !== null || metrics.pageViews !== null || metrics.downloads !== null;
  const hasFinancialMetric = metrics.proceeds !== null;
  const hasEngagementMetric = metrics.conversionRate !== null;
  
  // Count how many critical metrics we have
  const criticalMetrics = ['impressions', 'pageViews', 'downloads', 'conversionRate', 'proceeds'];
  const criticalMetricsCount = criticalMetrics.filter(metric => metrics[metric] !== null).length;
  
  // Calculate confidence score - weighted by importance
  const totalMetrics = Object.keys(metrics).length;
  const presentMetrics = Object.values(metrics).filter(v => v !== null).length;
  const baseConfidence = (presentMetrics / totalMetrics) * 100;
  
  // Weight critical metrics more heavily
  const criticalWeight = 0.7;
  const regularWeight = 0.3;
  const criticalConfidence = (criticalMetricsCount / criticalMetrics.length) * 100;
  const weightedConfidence = (criticalConfidence * criticalWeight) + (baseConfidence * regularWeight);
  
  // Round to nearest whole number
  const confidence = Math.round(weightedConfidence);
  
  // Check for obviously invalid values (negative counts, extreme outliers)
  const invalidValues = Object.entries(metrics)
    .filter(([key, value]) => {
      if (value === null) return false;
      
      // Value validation based on metric type
      if (key === 'conversionRate' && (value < 0 || value > 100)) return true;
      if (key !== 'conversionRate' && key !== 'crashes' && value < 0) return true;
      
      return false;
    })
    .map(([key, _]) => key);
  
  if (invalidValues.length > 0) {
    console.warn("Found invalid values:", invalidValues);
  }
  
  // Data is valid if we have the minimum required metrics and no invalid values
  const isValid = criticalMetricsCount >= 3 && hasAcquisitionMetric && 
                 (hasFinancialMetric || hasEngagementMetric) && 
                 invalidValues.length === 0;
  
  return { 
    isValid, 
    missingFields, 
    confidence,
    estimatedFields
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { rawText, threadId, assistantId } = await req.json();
    console.log("Received raw text:", rawText.substring(0, 100) + "...");
    console.log("Using thread ID:", threadId);
    console.log("Using assistant ID:", assistantId);

    if (!rawText) {
      return new Response(
        JSON.stringify({ 
          error: "No text provided for processing",
          success: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Extract and normalize metrics
    const extractedMetrics = extractMetrics(rawText);
    console.log("Extracted metrics:", extractedMetrics);
    
    // Extract change percentages
    const extractedChanges = extractChangePercentages(rawText);
    console.log("Extracted changes:", extractedChanges);

    // Validate the data
    const validation = validateData(extractedMetrics, extractedChanges);
    console.log("Validation result:", validation);

    // Create structured data
    const structuredData = {
      metrics: {
        acquisitionMetrics: {
          impressions: extractedMetrics.impressions,
          pageViews: extractedMetrics.pageViews,
          downloads: extractedMetrics.downloads,
          conversionRate: extractedMetrics.conversionRate
        },
        financialMetrics: {
          proceeds: extractedMetrics.proceeds
        },
        technicalMetrics: {
          crashes: extractedMetrics.crashes
        }
      },
      changes: {
        impressionsChange: extractedChanges.impressionsChange,
        pageViewsChange: extractedChanges.pageViewsChange,
        downloadsChange: extractedChanges.downloadsChange,
        conversionRateChange: extractedChanges.conversionRateChange,
        proceedsChange: extractedChanges.proceedsChange,
        crashesChange: extractedChanges.crashesChange
      },
      validation: {
        isValid: validation.isValid,
        missingFields: validation.missingFields,
        confidence: validation.confidence,
        estimatedFields: validation.estimatedFields
      },
      rawTextLength: rawText.length,
      processedAt: new Date().toISOString()
    };

    // If valid, store in Supabase and send to OpenAI
    if (validation.isValid) {
      // This would be where you store the data in Supabase
      // For now, we'll just log it
      console.log("Valid data extracted, would store in Supabase:", structuredData);
      
      // If thread ID and assistant ID are provided, we could send to OpenAI
      if (threadId && assistantId) {
        console.log("Would send to OpenAI assistant:", assistantId);
        // This is where you would implement the OpenAI call
        // For now, we'll just process the data
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        cleanText: cleanText(rawText),
        message: validation.isValid 
          ? "Data successfully processed and structured" 
          : `Data partially processed. Missing: ${validation.missingFields.join(', ')}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error processing data:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
