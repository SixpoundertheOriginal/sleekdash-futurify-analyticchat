
// Change extractors for directional changes
export const extractChangeValue = (text: string, metricName: string): number | null => {
  // Pattern types with direction detection
  const patternTypes = [
    // Format: "X increased/decreased by Y%"
    { 
      pattern: new RegExp(`${metricName}.*?(increased|decreased) by\\s*([\\d.]+)%`, 'i'),
      directionGroup: 1,
      valueGroup: 2
    },
    // Format: "X (increase/decrease of Y%)"
    { 
      pattern: new RegExp(`${metricName}.*?\\((an? )?(increase|decrease) of\\s*([\\d.]+)%\\)`, 'i'),
      directionGroup: 2,
      valueGroup: 3
    },
    // Format: "X (+/-Y%)"
    { 
      pattern: new RegExp(`${metricName}.*?\\(([+-][\\d.]+)%\\)`, 'i'),
      signInValue: true,
      valueGroup: 1
    }
  ];
  
  for (const patternType of patternTypes) {
    const match = text.match(patternType.pattern);
    if (!match) continue;
    
    if (patternType.signInValue) {
      // The sign is included in the matched value
      return parseFloat(match[patternType.valueGroup]);
    } else {
      // Direction and value are separate
      const directionText = match[patternType.directionGroup];
      const valueText = match[patternType.valueGroup];
      
      if (valueText) {
        let value = parseFloat(valueText);
        
        // Adjust sign based on direction
        if (directionText && 
           (directionText.toLowerCase().includes('decrease') || 
            directionText.toLowerCase().includes('decreased'))) {
          value = -value;
        }
        
        return value;
      }
    }
  }
  
  return null;
};
