
export interface RetentionData {
  day: string;
  rate: number;
}

const defaultRetentionData = [
  { day: "Day 1", rate: 17.41 },
  { day: "Day 7", rate: 2.35 },
  { day: "Day 14", rate: 1.4 },
  { day: "Day 28", rate: 0.8 },
];

export const parseRetentionData = (analysisText: string): RetentionData[] => {
  try {
    // Identify the retention section using multiple patterns
    const retentionSectionPatterns = [
      /Retention Rates[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i,
      /User Retention[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i,
      /Retention[:\s]+([\s\S]*?)(?=\n\n|\n-|\n\d\.|\n#|\Z)/i
    ];
    
    const dayRetentionPatterns = [
      /Day\s*(\d+)\s*Retention:?\s*([\d.]+)%/gi,
      /D[-\s]*(\d+)(?:\s*retention)?:?\s*([\d.]+)%/gi,
      /(\d+)[-\s]*day\s*retention:?\s*([\d.]+)%/gi,
      /(\d+)\s*days?:?\s*([\d.]+)%/gi,
      /After\s*(\d+)\s*days?:?\s*([\d.]+)%/gi,
      /Retention\s*\(?day\s*(\d+)\)?:?\s*([\d.]+)%/gi
    ];
    
    // Find retention section
    let retentionText = '';
    for (const pattern of retentionSectionPatterns) {
      const retentionSection = analysisText.match(pattern);
      if (retentionSection && retentionSection[1]) {
        retentionText = retentionSection[1];
        break;
      }
    }
    
    if (!retentionText) {
      retentionText = analysisText;
    }
    
    const retentionRates = new Map();
    
    // Try each pattern to find retention data
    for (const pattern of dayRetentionPatterns) {
      pattern.lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(retentionText)) !== null) {
        const day = parseInt(match[1]);
        const rate = parseFloat(match[2]);
        
        if (!isNaN(day) && !isNaN(rate)) {
          retentionRates.set(day, rate);
        }
      }
    }
    
    if (retentionRates.size > 0) {
      return Array.from(retentionRates.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([day, rate]) => ({
          day: `Day ${day}`,
          rate
        }));
    }
    
    return defaultRetentionData;
  } catch (error) {
    console.error('Error parsing retention data:', error);
    return defaultRetentionData;
  }
};
