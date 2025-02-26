
import { Download, DollarSign, Users, Target } from "lucide-react";

export const formatValue = (value: number, prefix = '') => {
  if (value >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}K`;
  } else {
    return `${prefix}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
  }
};

const extractMetric = (analysisText: string, metricPatterns: RegExp[], defaultValue: number) => {
  for (const pattern of metricPatterns) {
    const match = analysisText.match(pattern);
    if (match && match[1]) {
      // Clean the extracted value - remove commas, handle K/M suffixes
      const rawValue = match[1].trim().replace(/,/g, '');
      if (rawValue.endsWith('K') || rawValue.endsWith('k')) {
        return parseFloat(rawValue.slice(0, -1)) * 1000;
      } else if (rawValue.endsWith('M') || rawValue.endsWith('m')) {
        return parseFloat(rawValue.slice(0, -1)) * 1000000;
      } else {
        return parseFloat(rawValue);
      }
    }
  }
  return defaultValue;
};

const extractChange = (analysisText: string, metricPatterns: RegExp[], defaultValue: number) => {
  for (const pattern of metricPatterns) {
    const match = analysisText.match(pattern);
    if (match && match[1] && match[2]) {
      const direction = match[1].toLowerCase().includes('increase') ? 1 : -1;
      return direction * parseFloat(match[2]);
    }
  }
  return defaultValue;
};

export const parseMetricsFromAnalysis = (analysisText: string) => {
  try {
    console.log('Parsing metrics from:', analysisText);
    
    // Multiple patterns for each metric type
    const downloadsPatterns = [
      /Total Downloads:\s*([\d,.km]+)/i,
      /Downloads:\s*([\d,.km]+)/i,
      /downloads of\s*([\d,.km]+)/i,
      /downloads:\s*([\d,.km]+)/i
    ];
    
    const proceedsPatterns = [
      /Total Proceeds:\s*\$?([\d,.km]+)/i,
      /Proceeds:\s*\$?([\d,.km]+)/i,
      /Revenue:\s*\$?([\d,.km]+)/i,
      /revenue of\s*\$?([\d,.km]+)/i
    ];
    
    const conversionPatterns = [
      /Conversion Rate:\s*([\d.]+)%/i,
      /conversion of\s*([\d.]+)%/i,
      /conversion rate:?\s*([\d.]+)%/i
    ];
    
    const crashPatterns = [
      /Crash Count:\s*([\d,.km]+)/i,
      /crashes:\s*([\d,.km]+)/i,
      /crash rate of\s*([\d.]+)/i,
      /(\d+)\s+crashes/i
    ];

    // Extract metrics
    const downloads = extractMetric(analysisText, downloadsPatterns, 7910);
    const proceedsValue = extractMetric(analysisText, proceedsPatterns, 4740);
    const conversionRate = extractMetric(analysisText, conversionPatterns, 2.84);
    const crashCount = extractMetric(analysisText, crashPatterns, 116);
    
    // Change patterns with direction awareness
    const downloadsChangePatterns = [
      /downloads.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i,
      /downloads.*?(increased|decreased) by\s*([\d.]+)%/i
    ];
    
    const proceedsChangePatterns = [
      /proceeds.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i,
      /revenue.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i
    ];
    
    const conversionChangePatterns = [
      /conversion rate.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i,
      /conversion.*?(increased|decreased) by\s*([\d.]+)%/i
    ];
    
    const crashChangePatterns = [
      /crash count.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i,
      /crashes.*?(increased|decreased) by\s*([\d.]+)%/i
    ];

    // Extract changes
    const downloadsChange = extractChange(analysisText, downloadsChangePatterns, -27);
    const proceedsChange = extractChange(analysisText, proceedsChangePatterns, -15);
    const conversionChange = extractChange(analysisText, conversionChangePatterns, 6);
    const crashChange = extractChange(analysisText, crashChangePatterns, 132);

    return [
      {
        metric: "Downloads",
        value: formatValue(downloads),
        change: downloadsChange,
        icon: Download
      },
      {
        metric: "Total Proceeds",
        value: formatValue(proceedsValue, '$'),
        change: proceedsChange,
        icon: DollarSign
      },
      {
        metric: "Active Users",
        value: conversionRate.toString(),
        change: conversionChange,
        icon: Users
      },
      {
        metric: "Crash Count",
        value: Math.round(crashCount).toString(),
        change: crashChange,
        icon: Target
      }
    ];
  } catch (error) {
    console.error('Error parsing metrics:', error);
    throw error;
  }
};
