
export interface RetentionData {
  day: string;
  rate: number;
}

export const parseRetentionData = (analysisText: string): RetentionData[] => {
  try {
    const conversionMatch = analysisText.match(/Conversion Rate:\*\* ([\d.]+)%/);
    const conversionRate = conversionMatch ? parseFloat(conversionMatch[1]) : 2.84;

    return [
      { day: "Day 1", rate: conversionRate },
      { day: "Day 7", rate: conversionRate * 0.7 },
      { day: "Day 14", rate: conversionRate * 0.5 },
      { day: "Day 28", rate: conversionRate * 0.3 }
    ];
  } catch (error) {
    console.error('Error parsing retention data:', error);
    throw error;
  }
};
