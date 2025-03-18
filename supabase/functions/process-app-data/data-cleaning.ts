
// Text cleaning and data normalization utilities

/**
 * Clean and normalize text for processing
 * @param text Raw text to clean
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  if (!text || typeof text !== 'string') {
    console.log('Invalid input to cleanText: not a string or empty');
    return '';
  }
  
  console.log("Original text length:", text.length);
  
  // Handle special characters while preserving important data markers
  let cleaned = text
    .replace(/\r\n/g, '\n')  // Normalize newlines
    .replace(/[^\w\s.,:%$+\-\n?]/g, " ")  // Keep newlines and question marks for format detection
    .replace(/\s+/g, " ")
    .trim();
  
  console.log("Cleaned text length:", cleaned.length);
  return cleaned;
}

/**
 * Normalize numeric values with handling for suffixes (K, M, B)
 * @param numStr The string representation of the number
 * @param unit The unit type (count, currency, percentage)
 * @returns Normalized number value
 */
export function normalizeNumber(numStr: string, unit: string = 'count'): number {
  if (!numStr || typeof numStr !== 'string') {
    console.log('Invalid input to normalizeNumber:', numStr);
    return NaN;
  }
  
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
  
  // Safety check for non-numeric values
  if (isNaN(parseFloat(normalized))) {
    console.log('Non-numeric value after normalization:', normalized);
    return 0;
  }
  
  const result = parseFloat(normalized);
  console.log("Normalized result:", result);
  return result;
}

/**
 * Preprocess text input to normalize formatting specifically for analytics extraction
 * @param text The input text to normalize
 * @returns Preprocessed text with consistent formatting
 */
export function preprocessAnalyticsText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Apply multi-step normalization
  return text
    .replace(/\r\n/g, '\n')  // Standardize line breaks
    .replace(/\n{3,}/g, '\n\n')  // Reduce excessive line breaks
    .replace(/\s{2,}/g, ' ')  // Reduce multiple spaces
    .replace(/(\d),(\d)/g, '$1$2')  // Remove commas from numbers (e.g. 1,000 -> 1000)
    .replace(/\s*\?\s*/g, ' ? ')  // Normalize spacing around question marks
    .replace(/(\d)([KMBkmb])(\s|$)/g, '$1$2$3')  // Ensure consistent spacing for K/M/B suffixes
    .replace(/(\d)%/g, '$1 %')  // Add space before percentage
    .replace(/\$(\d)/g, '$ $1')  // Add space after dollar sign
    .trim();
}
