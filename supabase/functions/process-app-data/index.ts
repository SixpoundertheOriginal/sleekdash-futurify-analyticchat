
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Enhanced date extraction patterns
const datePatterns = [
  /([A-Za-z]+ \d{1,2})[\s-]+([A-Za-z]+ \d{1,2})/i, // "Feb 2 - Mar 3"
  /(\d{2}\/\d{2}\/\d{4})[\s-]+(\d{2}\/\d{2}\/\d{4})/i, // "02/02/2025 - 03/03/2025"
  /(\d{4}-\d{2}-\d{2})[\s-]+(\d{4}-\d{2}-\d{2})/i, // "2025-02-02 - 2025-03-03" (ISO format)
  /Date Range:[\s]*(.+?)(?:\n|$)/i, // "Date Range: Feb 2 - Mar 3"
];

// Define metric schema for structured parsing with improved patterns
const metricSchema = {
  impressions: {
    patterns: [
      /impressions[:\s]+([0-9,.]+[km]?)/i, 
      /([0-9,.]+[km]?)[\s]*impressions/i,
      /impressions\s*\n?\s*([0-9,.]+[km]?)/i
    ],
    aliases: ['views', 'app views', 'product views'],
    unit: 'count',
    calculateFrom: {
      inputs: ['pageViews', 'conversionRate'],
      formula: (pageViews, conversionRate) => pageViews / (conversionRate / 100)
    }
  },
  pageViews: {
    patterns: [
      /page views[:\s]+([0-9,.]+[km]?)/i, 
      /product page views[:\s]+([0-9,.]+[km]?)/i, 
      /([0-9,.]+[km]?)[\s]*page views/i,
      /product page views\s*\n?\s*([0-9,.]+[km]?)/i
    ],
    aliases: ['product views', 'listing views', 'store views'],
    unit: 'count',
    calculateFrom: {
      inputs: ['impressions', 'conversionRate'],
      formula: (impressions, conversionRate) => impressions * (conversionRate / 100)
    }
  },
  downloads: {
    patterns: [
      /downloads[:\s]+([0-9,.]+[km]?)/i, 
      /([0-9,.]+[km]?)[\s]*downloads/i, 
      /total downloads[:\s]+([0-9,.]+[km]?)/i,
      /total downloads\s*\n?\s*([0-9,.]+[km]?)/i
    ],
    aliases: ['installs', 'app installs', 'total installs'],
    unit: 'count',
    calculateFrom: {
      inputs: ['pageViews', 'conversionRate'],
      formula: (pageViews, conversionRate) => pageViews * (conversionRate / 100)
    }
  },
  conversionRate: {
    patterns: [
      /conversion rate[:\s]+([0-9,.]+)%/i, 
      /([0-9,.]+)%[\s]*conversion/i,
      /conversion rate\s*\n?\s*([0-9,.]+)%/i
    ],
    aliases: ['conv rate', 'cvr', 'conversion percentage'],
    unit: 'percentage',
    calculateFrom: {
      inputs: ['downloads', 'pageViews'],
      formula: (downloads, pageViews) => pageViews > 0 ? (downloads / pageViews) * 100 : null
    }
  },
  proceeds: {
    patterns: [
      /proceeds[:\s]*\$?([0-9,.]+[km]?)/i, 
      /revenue[:\s]*\$?([0-9,.]+[km]?)/i, 
      /\$([0-9,.]+[km]?)[\s]*proceeds/i,
      /proceeds\s*\n?\s*\$?([0-9,.]+[km]?)/i
    ],
    aliases: ['revenue', 'sales', 'income'],
    unit: 'currency',
    calculateFrom: {
      inputs: ['downloads', 'arpu'],
      formula: (downloads, arpu) => downloads * arpu
    }
  },
  crashes: {
    patterns: [
      /crashes?[:\s]+([0-9,.]+)/i, 
      /([0-9,.]+)[\s]*crashes/i, 
      /crash count[:\s]+([0-9,.]+)/i,
      /crashes\s*\n?\s*([0-9,.]+)/i
    ],
    aliases: ['app crashes', 'error count', 'failures'],
    unit: 'count',
    calculateFrom: null
  },
  sessionsPerDevice: {
    patterns: [
      /sessions per active device[:\s]+([0-9,.]+)/i,
      /([0-9,.]+)[\s]*sessions per active device/i,
      /sessions per active device\s*\n?\s*([0-9,.]+)/i
    ],
    aliases: ['sessions per user', 'active sessions'],
    unit: 'count',
    calculateFrom: null
  },
  proceedsPerUser: {
    patterns: [
      /proceeds per paying user[:\s]+\$?([0-9,.]+)/i,
      /\$?([0-9,.]+)[\s]*proceeds per paying user/i,
      /proceeds per paying user\s*\n?\s*\$?([0-9,.]+)/i
    ],
    aliases: ['revenue per user', 'arpu', 'average revenue per user'],
    unit: 'currency',
    calculateFrom: null
  }
};

// Enhanced change patterns for percent changes with more variations
const changeSchema = {
  impressionsChange: {
    patternTypes: [
      { pattern: /impressions.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /impressions.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /impressions.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /impressions\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /impressions\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'impressions'
  },
  pageViewsChange: {
    patternTypes: [
      { pattern: /page views.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /page views.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /page views.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /product page views\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /product page views\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'pageViews'
  },
  downloadsChange: {
    patternTypes: [
      { pattern: /downloads.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /downloads.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /downloads.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /total downloads\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /total downloads\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'downloads'
  },
  conversionRateChange: {
    patternTypes: [
      { pattern: /conversion rate.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /conversion.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /conversion rate.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /conversion rate\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /conversion rate\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'conversionRate'
  },
  proceedsChange: {
    patternTypes: [
      { pattern: /proceeds.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /revenue.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /proceeds.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /proceeds.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /proceeds\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /proceeds\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'proceeds'
  },
  crashesChange: {
    patternTypes: [
      { pattern: /crashes.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /crashes.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /crashes.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /crashes\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /crashes\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'crashes'
  },
  sessionsPerDeviceChange: {
    patternTypes: [
      { pattern: /sessions per active device.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /sessions per active device.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /sessions per active device.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /sessions per active device\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /sessions per active device\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'sessionsPerDevice'
  }
};

// Improved retention patterns
const retentionPatterns = {
  day1: {
    pattern: /day 1 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 1 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i
  },
  day7: {
    pattern: /day 7 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 7 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i
  },
  day14: {
    pattern: /day 14 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 14 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i
  },
  day28: {
    pattern: /day 28 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 28 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i
  }
};

// Enhanced text cleaning with improved handling
function cleanText(text: string): string {
  console.log("Original text length:", text.length);
  
  // Handle special characters while preserving important data markers
  let cleaned = text
    .replace(/[^\w\s.,:%$+\-\n]/g, " ")  // Keep newlines for format detection
    .replace(/\s+/g, " ")
    .trim();
  
  console.log("Cleaned text length:", cleaned.length);
  return cleaned;
}

// Extract date range with improved patterns
function extractDateRange(text: string): string | null {
  console.log("Extracting date range...");
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateRange = match[0].includes("Date Range:") ? match[1].trim() : match[0].trim();
      console.log("Found date range:", dateRange);
      return dateRange;
    }
  }
  
  console.log("No date range found");
  return null;
}

// Enhanced normalization with unit awareness and improved suffix handling
function normalizeNumber(numStr: string, unit: string = 'count'): number {
  if (!numStr) return NaN;
  
  console.log("Normalizing number:", numStr, "with unit:", unit);
  
  // Remove commas and other formatting
  let normalized = numStr.replace(/,/g, "").trim();
  
  // Handle K/M/B suffix for thousands/millions/billions with improved case sensitivity
  if (/[kmb]$/i.test(normalized)) {
    const multiplier = normalized.slice(-1).toLowerCase() === 'k' ? 1000 : 
                       normalized.slice(-1).toLowerCase() === 'm' ? 1000000 : 
                       1000000000;
    normalized = normalized.slice(0, -1).trim();
    const result = parseFloat(normalized) * multiplier;
    console.log("Normalized with suffix:", result);
    return result;
  }
  
  // Handle currency symbols
  if (unit === 'currency') {
    normalized = normalized.replace(/^\$/, "");
  }
  
  // Handle percentage
  if (unit === 'percentage' && normalized.endsWith('%')) {
    normalized = normalized.slice(0, -1);
  }
  
  const result = parseFloat(normalized);
  console.log("Normalized result:", result);
  return result;
}

// Extract metrics with improved pattern matching and fallbacks
function extractMetrics(text: string): Record<string, number | null> {
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
  
  // Extract retention data with improved patterns
  const retention: Record<string, { value: number | null, benchmark: number | null }> = {};
  
  for (const [day, patterns] of Object.entries(retentionPatterns)) {
    const valueMatch = cleanedText.match(patterns.pattern);
    const benchmarkMatch = cleanedText.match(patterns.benchmarkPattern);
    
    if (valueMatch && valueMatch[1]) {
      const value = parseFloat(valueMatch[1]);
      console.log(`Extracted ${day} retention: ${value}%`);
      
      retention[day] = {
        value: !isNaN(value) ? value : null,
        benchmark: null
      };
      
      if (benchmarkMatch && benchmarkMatch[2]) {
        const benchmark = parseFloat(benchmarkMatch[2]);
        console.log(`Extracted ${day} retention benchmark: ${benchmark}%`);
        if (!isNaN(benchmark)) {
          retention[day].benchmark = benchmark;
        }
      }
    } else {
      retention[day] = { value: null, benchmark: null };
    }
  }
  
  // After initial extraction, try to calculate missing values
  calculateMissingMetrics(result);
  
  return {
    ...result,
    retention: retention
  };
}

// Calculate missing metrics with improved logic
function calculateMissingMetrics(metrics: Record<string, number | null>): void {
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

// Extract change percentages with improved handling
function extractChangePercentages(text: string): Record<string, number | null> {
  const cleanedText = cleanText(text);
  const result: Record<string, number | null> = {};
  
  console.log("Extracting change percentages...");
  
  for (const [changeKey, changeConfig] of Object.entries(changeSchema)) {
    let found = false;
    
    for (const patternType of changeConfig.patternTypes) {
      const match = cleanedText.match(patternType.pattern);
      
      if (match) {
        let value = 0;
        let isNegative = false;
        
        // Handle explicit direction
        if (patternType.directionGroup !== null && match[patternType.directionGroup]) {
          const directionText = match[patternType.directionGroup];
          isNegative = directionText && 
             (directionText.toLowerCase().includes('decrease') || 
              directionText.toLowerCase().includes('decreased'));
        }
        
        // Handle signed values directly in the pattern
        if (match[patternType.valueGroup]) {
          const valueText = match[patternType.valueGroup];
          value = parseFloat(valueText.replace(/^[+]/, ''));
          
          // Check if the value itself has a sign
          if (valueText.startsWith('-')) {
            isNegative = true;
          }
        }
        
        // Apply pattern-specific direction flags
        if (patternType.isPositive) {
          isNegative = false;
        } else if (patternType.isNegative) {
          isNegative = true;
        }
        
        // Apply direction
        if (isNegative) {
          value = -value;
        }
        
        result[changeKey] = value;
        found = true;
        console.log(`Extracted ${changeKey}: ${value} (${isNegative ? 'negative' : 'positive'})`);
        break;
      }
    }
    
    // If not found, set to null
    if (!found) {
      result[changeKey] = null;
      console.log(`No change percentage found for ${changeKey}`);
    }
  }
  
  return result;
}

// Improved validation with confidence scoring
function validateData(
  metrics: Record<string, number | null>,
  changes: Record<string, number | null>,
  dateRange: string | null
): { 
  isValid: boolean; 
  missingFields: string[];
  confidence: number;
  estimatedFields: string[];
  dateRange: string | null;
} {
  console.log("Validating extracted data...");
  
  // Filter out retention field which is now a nested object
  const flatMetrics = Object.entries(metrics)
    .filter(([key]) => key !== 'retention')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  const missingFields = Object.entries(flatMetrics)
    .filter(([_, value]) => value === null)
    .map(([key, _]) => key);
  
  const estimatedFields = [];
  
  // Check date range validity
  const hasValidDateRange = dateRange !== null;
  if (!hasValidDateRange) {
    console.warn("No valid date range found");
  }
  
  // Consider data valid if we have at least 3 KPIs with at least 1 from each major category
  const hasAcquisitionMetric = 
    metrics.impressions !== null || 
    metrics.pageViews !== null || 
    metrics.downloads !== null;
    
  const hasFinancialMetric = 
    metrics.proceeds !== null || 
    metrics.proceedsPerUser !== null;
    
  const hasEngagementMetric = 
    metrics.conversionRate !== null || 
    metrics.sessionsPerDevice !== null;
  
  // Count how many critical metrics we have
  const criticalMetrics = [
    'impressions', 
    'pageViews', 
    'downloads', 
    'conversionRate', 
    'proceeds',
    'sessionsPerDevice'
  ];
  
  const criticalMetricsCount = criticalMetrics
    .filter(metric => metrics[metric as keyof typeof metrics] !== null)
    .length;
  
  // Calculate confidence score - weighted by importance
  const totalMetrics = Object.keys(flatMetrics).length;
  const presentMetrics = Object.values(flatMetrics).filter(v => v !== null).length;
  const baseConfidence = (presentMetrics / totalMetrics) * 100;
  
  // Weight critical metrics more heavily
  const criticalWeight = 0.7;
  const regularWeight = 0.3;
  const criticalConfidence = (criticalMetricsCount / criticalMetrics.length) * 100;
  const weightedConfidence = (criticalConfidence * criticalWeight) + (baseConfidence * regularWeight);
  
  // Round to nearest whole number
  const confidence = Math.round(weightedConfidence);
  
  // Check for obviously invalid values (negative counts, extreme outliers)
  const invalidValues = Object.entries(flatMetrics)
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
  
  // Data is valid if:
  // 1. We have the minimum required metrics
  // 2. We have at least one acquisition metric and either a financial or engagement metric
  // 3. No invalid values were detected
  // 4. We have a valid date range
  const isValid = 
    criticalMetricsCount >= 2 && 
    (hasAcquisitionMetric && (hasFinancialMetric || hasEngagementMetric)) && 
    invalidValues.length === 0 &&
    hasValidDateRange;
  
  console.log("Validation complete:", {
    isValid, 
    confidence,
    criticalMetricsCount,
    hasAcquisitionMetric,
    hasFinancialMetric,
    hasEngagementMetric
  });
  
  return { 
    isValid, 
    missingFields, 
    confidence,
    estimatedFields,
    dateRange
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Process app data function called");
    const { rawText, threadId, assistantId } = await req.json();
    
    if (!rawText) {
      console.error("No text provided for processing");
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
    
    console.log("Received raw text length:", rawText.length);
    console.log("Processing text sample:", rawText.substring(0, 100) + "...");
    
    if (threadId) {
      console.log("Using thread ID:", threadId);
    }
    
    if (assistantId) {
      console.log("Using assistant ID:", assistantId);
    }

    // Extract date range first
    const dateRange = extractDateRange(rawText);
    console.log("Extracted date range:", dateRange);

    // Extract and normalize metrics
    const extractedMetrics = extractMetrics(rawText);
    console.log("Extracted metrics count:", Object.values(extractedMetrics).filter(v => v !== null && v !== undefined).length);
    
    // Extract change percentages
    const extractedChanges = extractChangePercentages(rawText);
    console.log("Extracted changes count:", Object.values(extractedChanges).filter(v => v !== null).length);

    // Validate the data
    const validation = validateData(extractedMetrics, extractedChanges, dateRange);
    console.log("Validation result:", validation);

    // Create structured data
    const structuredData = {
      dateRange: dateRange,
      metrics: {
        acquisitionMetrics: {
          impressions: extractedMetrics.impressions,
          pageViews: extractedMetrics.pageViews,
          downloads: extractedMetrics.downloads,
          conversionRate: extractedMetrics.conversionRate
        },
        financialMetrics: {
          proceeds: extractedMetrics.proceeds,
          proceedsPerUser: extractedMetrics.proceedsPerUser
        },
        engagementMetrics: {
          sessionsPerDevice: extractedMetrics.sessionsPerDevice
        },
        technicalMetrics: {
          crashes: extractedMetrics.crashes
        },
        retentionMetrics: extractedMetrics.retention
      },
      changes: {
        impressionsChange: extractedChanges.impressionsChange,
        pageViewsChange: extractedChanges.pageViewsChange,
        downloadsChange: extractedChanges.downloadsChange,
        conversionRateChange: extractedChanges.conversionRateChange,
        proceedsChange: extractedChanges.proceedsChange,
        crashesChange: extractedChanges.crashesChange,
        sessionsPerDeviceChange: extractedChanges.sessionsPerDeviceChange
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

    // If valid, we could store in Supabase in the future
    if (validation.isValid) {
      console.log("Valid data extracted, could store in Supabase in future implementation");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        cleanText: cleanText(rawText).substring(0, 500) + "...", // Send partial cleaned text to keep response size reasonable
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
