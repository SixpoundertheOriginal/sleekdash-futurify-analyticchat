
/**
 * Normalize a value with K/M/B suffix to a number
 * @param value The value to normalize (e.g., "2.91M")
 * @returns Normalized number value
 */
export function normalizeValue(value: string): number {
  if (!value) return 0;
  
  // Remove commas
  let normalized = value.replace(/,/g, '');
  
  // Handle K/M/B suffixes
  if (/\d+(\.\d+)?[kK]$/i.test(normalized)) {
    return parseFloat(normalized.replace(/[kK]$/i, '')) * 1000;
  } else if (/\d+(\.\d+)?[mM]$/i.test(normalized)) {
    return parseFloat(normalized.replace(/[mM]$/i, '')) * 1000000;
  } else if (/\d+(\.\d+)?[bB]$/i.test(normalized)) {
    return parseFloat(normalized.replace(/[bB]$/i, '')) * 1000000000;
  }
  
  // Handle currency symbols
  normalized = normalized.replace(/[$€£¥]/g, '');
  
  return parseFloat(normalized) || 0;
}

/**
 * Format a percentage change value
 * @param changeStr The percentage change string (e.g., "+30%")
 * @returns Normalized percentage change value
 */
export function normalizePercentageChange(changeStr: string): number {
  if (!changeStr) return 0;
  
  // Remove the % symbol and convert to number
  const cleanChange = changeStr.replace(/[%\s]/g, '');
  
  if (cleanChange.startsWith('+')) {
    return parseFloat(cleanChange.substring(1));
  } else if (cleanChange.startsWith('-')) {
    return parseFloat(cleanChange);
  } else {
    return parseFloat(cleanChange);
  }
}
