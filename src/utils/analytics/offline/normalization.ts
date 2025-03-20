
/**
 * Normalize metric values (handling K, M, B suffixes, etc.)
 */
export const normalizeValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  if (!value) return 0;
  
  try {
    // Clean the value (remove commas, whitespace, etc.)
    const cleanValue = value.toString().trim().replace(/,/g, '');
    
    // Handle suffixes (K, M, B)
    if (/\d+(\.\d+)?[Kk]$/.test(cleanValue)) {
      return parseFloat(cleanValue.replace(/[Kk]$/, '')) * 1000;
    } else if (/\d+(\.\d+)?[Mm]$/.test(cleanValue)) {
      return parseFloat(cleanValue.replace(/[Mm]$/, '')) * 1000000;
    } else if (/\d+(\.\d+)?[Bb]$/.test(cleanValue)) {
      return parseFloat(cleanValue.replace(/[Bb]$/, '')) * 1000000000;
    }
    
    // Regular numeric value
    return parseFloat(cleanValue);
  } catch (error) {
    console.error('Error normalizing value:', error, 'Value was:', value);
    return 0;
  }
};

/**
 * Parse percent change values like "+15%" or "-3%"
 */
export const normalizePercentChange = (change: string | number): number => {
  if (typeof change === 'number') return change;
  
  if (!change) return 0;
  
  try {
    // Clean the value
    const cleanValue = change.toString().trim();
    
    // Extract the number from percentage strings like "+15%"
    const percentMatch = cleanValue.match(/([+-]?\d+(?:\.\d+)?)%/);
    if (percentMatch && percentMatch[1]) {
      return parseFloat(percentMatch[1]);
    }
    
    // Handle text values like "increased by 10%" or "decreased by 5%"
    if (cleanValue.toLowerCase().includes('increased')) {
      const numMatch = cleanValue.match(/(\d+(?:\.\d+)?)%/);
      return numMatch ? parseFloat(numMatch[1]) : 0;
    } else if (cleanValue.toLowerCase().includes('decreased')) {
      const numMatch = cleanValue.match(/(\d+(?:\.\d+)?)%/);
      return numMatch ? -parseFloat(numMatch[1]) : 0;
    }
    
    // Default: try to parse as a number
    return parseFloat(cleanValue);
  } catch (error) {
    console.error('Error normalizing percent change:', error, 'Value was:', change);
    return 0;
  }
};
