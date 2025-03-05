
// Extract changes and percentages from text
import { changeSchema, retentionPatterns } from './extractors';
import { cleanText } from './data-cleaning';

/**
 * Extract change percentages from analysis text
 * @param text The text to extract changes from
 * @returns Record of extracted changes
 */
export function extractChangePercentages(text: string): Record<string, number | null> {
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

/**
 * Extract retention data from text
 * @param text The text to extract retention data from
 * @returns Record of retention data
 */
export function extractRetentionData(text: string): Record<string, { value: number | null, benchmark: number | null }> {
  const cleanedText = cleanText(text);
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
  
  return retention;
}
