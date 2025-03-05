
// Validation utilities for processed data

/**
 * Validate extracted data for completeness and confidence
 * @param metrics Extracted metrics
 * @param changes Extracted change percentages
 * @param dateRange Extracted date range
 * @returns Validation result with confidence score
 */
export function validateData(
  metrics: Record<string, any>,
  changes: Record<string, number | null>,
  dateRange: string | null
): { 
  isValid: boolean;
  missingFields: string[];
  confidence: number;
  estimatedFields: string[];
} {
  console.log("Validating extracted data...");
  
  // Check required fields
  const requiredMetrics = ['impressions', 'pageViews', 'downloads', 'conversionRate', 'proceeds'];
  const missingFields: string[] = [];
  
  for (const field of requiredMetrics) {
    if (metrics[field] === null || metrics[field] === undefined) {
      missingFields.push(field);
      console.log(`Missing required field: ${field}`);
    }
  }
  
  if (!dateRange) {
    missingFields.push('dateRange');
    console.log("Missing required field: dateRange");
  }
  
  // Track which fields we had to estimate
  const estimatedFields: string[] = [];
  for (const [key, value] of Object.entries(metrics)) {
    if (value === null && requiredMetrics.includes(key)) {
      estimatedFields.push(key);
      console.log(`Field needed estimation: ${key}`);
    }
  }
  
  // Calculate confidence score based on missing fields and changes
  let confidence = 100;
  
  // Reduce confidence for missing required fields
  confidence -= missingFields.length * 15;
  
  // Reduce confidence for estimated fields
  confidence -= estimatedFields.length * 10;
  
  // Reduce confidence for missing change percentages
  const missingChanges = Object.values(changes).filter(v => v === null).length;
  confidence -= missingChanges * 5;
  
  // Ensure confidence is within 0-100 range
  confidence = Math.max(0, Math.min(100, confidence));
  
  console.log(`Validation confidence: ${confidence}%`);
  
  // Data is valid if we have all required metrics or acceptable substitutes
  const isValid = missingFields.length === 0 || confidence > 50;
  
  return {
    isValid,
    missingFields,
    confidence,
    estimatedFields
  };
}
