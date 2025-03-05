
import { MetricExtractor, normalizeValue } from "./metricTypes";
import { formatValue, formatCurrency, formatPercentage } from "./formatters";

// Structure for extracting metrics with fallbacks
export const metricExtractors: Record<string, MetricExtractor> = {
  downloads: {
    patterns: [
      /Total Downloads:\s*([\d,.km]+)/i,
      /Downloads:\s*([\d,.km]+)/i,
      /downloads of\s*([\d,.km]+)/i,
      /downloads:\s*([\d,.km]+)/i
    ],
    aliases: ['installs', 'app installs', 'total installs'],
    formatter: formatValue,
    extractValue: (text: string) => {
      for (const pattern of metricExtractors.downloads.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return normalizeValue(match[1]);
        }
      }
      
      // Try aliases
      for (const alias of metricExtractors.downloads.aliases || []) {
        const aliasPatterns = [
          new RegExp(`${alias}[:\\s]+([\\d,.km]+)`, 'i'),
          new RegExp(`([\\d,.km]+)[\\s]*${alias}`, 'i')
        ];
        
        for (const pattern of aliasPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return normalizeValue(match[1]);
          }
        }
      }
      
      return null;
    },
    calculateFromOthers: (metrics) => {
      if (metrics.pageViews !== null && metrics.conversionRate !== null) {
        return metrics.pageViews * (metrics.conversionRate / 100);
      }
      return null;
    }
  },
  
  proceeds: {
    patterns: [
      /Total Proceeds:\s*\$?([\d,.km]+)/i,
      /Proceeds:\s*\$?([\d,.km]+)/i,
      /Revenue:\s*\$?([\d,.km]+)/i,
      /revenue of\s*\$?([\d,.km]+)/i
    ],
    aliases: ['sales', 'income', 'earnings'],
    formatter: formatCurrency,
    extractValue: (text: string) => {
      for (const pattern of metricExtractors.proceeds.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return normalizeValue(match[1]);
        }
      }
      
      // Try aliases
      for (const alias of metricExtractors.proceeds.aliases || []) {
        const aliasPatterns = [
          new RegExp(`${alias}[:\\s]+\\$?([\\d,.km]+)`, 'i'),
          new RegExp(`\\$?([\\d,.km]+)[\\s]*${alias}`, 'i')
        ];
        
        for (const pattern of aliasPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return normalizeValue(match[1]);
          }
        }
      }
      
      return null;
    },
    calculateFromOthers: (metrics) => {
      // If we have ARPU (Average Revenue Per User) and downloads
      if (metrics.arpu !== null && metrics.downloads !== null) {
        return metrics.arpu * metrics.downloads;
      }
      return null;
    }
  },
  
  conversionRate: {
    patterns: [
      /Conversion Rate:\s*([\d.]+)%/i,
      /conversion of\s*([\d.]+)%/i,
      /conversion rate:?\s*([\d.]+)%/i
    ],
    aliases: ['cvr', 'conversion percentage', 'conv rate'],
    formatter: formatPercentage,
    extractValue: (text: string) => {
      for (const pattern of metricExtractors.conversionRate.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return parseFloat(match[1]);
        }
      }
      
      // Try aliases
      for (const alias of metricExtractors.conversionRate.aliases || []) {
        const aliasPatterns = [
          new RegExp(`${alias}[:\\s]+([\\d.]+)%`, 'i'),
          new RegExp(`([\\d.]+)%[\\s]*${alias}`, 'i')
        ];
        
        for (const pattern of aliasPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return parseFloat(match[1]);
          }
        }
      }
      
      return null;
    },
    calculateFromOthers: (metrics) => {
      if (metrics.downloads !== null && metrics.pageViews !== null && metrics.pageViews > 0) {
        return (metrics.downloads / metrics.pageViews) * 100;
      }
      return null;
    }
  },
  
  crashes: {
    patterns: [
      /Crash Count:\s*([\d,.km]+)/i,
      /crashes:\s*([\d,.km]+)/i,
      /crash rate of\s*([\d.]+)/i,
      /(\d+)\s+crashes/i
    ],
    aliases: ['errors', 'app crashes', 'error count'],
    formatter: (value: number) => Math.round(value).toString(),
    extractValue: (text: string) => {
      for (const pattern of metricExtractors.crashes.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return normalizeValue(match[1]);
        }
      }
      
      // Try aliases
      for (const alias of metricExtractors.crashes.aliases || []) {
        const aliasPatterns = [
          new RegExp(`${alias}[:\\s]+([\\d,.km]+)`, 'i'),
          new RegExp(`([\\d,.km]+)[\\s]*${alias}`, 'i')
        ];
        
        for (const pattern of aliasPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return normalizeValue(match[1]);
          }
        }
      }
      
      return null;
    }
  }
};
