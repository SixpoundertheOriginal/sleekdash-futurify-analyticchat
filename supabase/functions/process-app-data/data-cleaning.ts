
// Text cleaning and data normalization utilities

/**
 * Clean and normalize text for processing
 * @param text Raw text to clean
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  console.log("Original text length:", text.length);
  
  // Handle special characters while preserving important data markers
  let cleaned = text
    .replace(/[^\w\s.,:%$+\-\n]/g, " ")  // Keep newlines for format detection
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
