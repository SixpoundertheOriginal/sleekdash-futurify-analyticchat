
/**
 * Utility functions for normalizing metric values
 */

/**
 * Normalize numeric value that may have K/M suffix
 * @param value String representation of a number, possibly with K/M suffix
 * @returns Normalized numeric value
 */
export const normalizeValue = (value: string): number => {
  if (!value) return NaN;
  
  // Remove commas
  let normalized = value.replace(/,/g, '');
  
  // Handle K/M/B suffixes
  if (/k$/i.test(normalized)) {
    return parseFloat(normalized.slice(0, -1)) * 1000;
  } else if (/m$/i.test(normalized)) {
    return parseFloat(normalized.slice(0, -1)) * 1000000;
  } else if (/b$/i.test(normalized)) {
    return parseFloat(normalized.slice(0, -1)) * 1000000000;
  }
  
  return parseFloat(normalized);
};
