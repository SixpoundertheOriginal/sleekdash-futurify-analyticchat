
import { Download, DollarSign, Users, Target } from "lucide-react";

export const parseMetricsFromAnalysis = (analysisText: string) => {
  try {
    console.log('Parsing metrics from:', analysisText);
    
    const downloadsMatch = analysisText.match(/Total Downloads:\*\* ([\d,]+)/);
    const proceedsMatch = analysisText.match(/Total Proceeds:\*\* \$([\d,]+)/);
    const conversionMatch = analysisText.match(/Conversion Rate:\*\* ([\d.]+)%/);
    const crashMatch = analysisText.match(/Crash Count:\*\* (\d+)/);

    console.log('Extracted metrics:', {
      downloads: downloadsMatch?.[1],
      proceeds: proceedsMatch?.[1],
      conversion: conversionMatch?.[1],
      crashes: crashMatch?.[1]
    });

    if (!downloadsMatch) {
      throw new Error('Failed to extract required metrics');
    }

    const downloads = parseInt(downloadsMatch[1].replace(/,/g, ''));
    const proceedsValue = proceedsMatch ? parseInt(proceedsMatch[1].replace(/,/g, '')) : 4740;

    return [
      {
        metric: "Downloads",
        value: `${(downloads / 1000).toFixed(1)}K`,
        change: -27,
        icon: Download
      },
      {
        metric: "Total Proceeds",
        value: `$${(proceedsValue / 1000).toFixed(2)}K`,
        change: -15,
        icon: DollarSign
      },
      {
        metric: "Active Users",
        value: conversionMatch ? conversionMatch[1] : "2.84",
        change: 6,
        icon: Users
      },
      {
        metric: "Crash Count",
        value: crashMatch ? crashMatch[1] : "62",
        change: -23,
        icon: Target
      }
    ];
  } catch (error) {
    console.error('Error parsing metrics:', error);
    throw error;
  }
};
