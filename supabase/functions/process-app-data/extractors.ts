
// Extractors for different types of data from app store analytics

// Enhanced date extraction patterns with better regex matching
export const datePatterns = [
  /([A-Za-z]+ \d{1,2})[\s-–]+([A-Za-z]+ \d{1,2},? \d{4})/i, // "Feb 2 - Mar 3, 2025"
  /([A-Za-z]+ \d{1,2})[\s-–]+([A-Za-z]+ \d{1,2})/i, // "Feb 2 - Mar 3"
  /(\d{2}\/\d{2}\/\d{4})[\s-–]+(\d{2}\/\d{2}\/\d{4})/i, // "02/02/2025 - 03/03/2025"
  /(\d{4}-\d{2}-\d{2})[\s-–]+(\d{4}-\d{2}-\d{2})/i, // "2025-02-02 - 2025-03-03" (ISO format)
  /Date Range:[\s]*(.+?)(?:\n|$)/i, // "Date Range: Feb 2 - Mar 3"
  /(?:Feb|Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s\d,-–]+\d{4}/i, // "Feb 3-Feb 9, 2025"
];

// Define metric schema for structured parsing with improved patterns
export const metricSchema = {
  impressions: {
    patterns: [
      /impressions[:\s]+([0-9,.]+[km]?)/i, 
      /([0-9,.]+[km]?)[\s]*impressions/i,
      /impressions\s*\n?\s*([0-9,.]+[km]?)/i
    ],
    aliases: ['views', 'app views', 'product views'],
    unit: 'count',
    calculateFrom: {
      inputs: ['pageViews', 'conversionRate'],
      formula: (pageViews: number, conversionRate: number) => pageViews / (conversionRate / 100)
    }
  },
  pageViews: {
    patterns: [
      /page views[:\s]+([0-9,.]+[km]?)/i, 
      /product page views[:\s]+([0-9,.]+[km]?)/i, 
      /([0-9,.]+[km]?)[\s]*page views/i,
      /product page views\s*\n?\s*([0-9,.]+[km]?)/i
    ],
    aliases: ['product views', 'listing views', 'store views'],
    unit: 'count',
    calculateFrom: {
      inputs: ['impressions', 'conversionRate'],
      formula: (impressions: number, conversionRate: number) => impressions * (conversionRate / 100)
    }
  },
  downloads: {
    patterns: [
      /downloads[:\s]+([0-9,.]+[km]?)/i, 
      /([0-9,.]+[km]?)[\s]*downloads/i, 
      /total downloads[:\s]+([0-9,.]+[km]?)/i,
      /total downloads\s*\n?\s*([0-9,.]+[km]?)/i
    ],
    aliases: ['installs', 'app installs', 'total installs'],
    unit: 'count',
    calculateFrom: {
      inputs: ['pageViews', 'conversionRate'],
      formula: (pageViews: number, conversionRate: number) => pageViews * (conversionRate / 100)
    }
  },
  conversionRate: {
    patterns: [
      /conversion rate[:\s]+([0-9,.]+)%/i, 
      /([0-9,.]+)%[\s]*conversion/i,
      /conversion rate\s*\n?\s*([0-9,.]+)%/i
    ],
    aliases: ['conv rate', 'cvr', 'conversion percentage'],
    unit: 'percentage',
    calculateFrom: {
      inputs: ['downloads', 'pageViews'],
      formula: (downloads: number, pageViews: number) => pageViews > 0 ? (downloads / pageViews) * 100 : null
    }
  },
  proceeds: {
    patterns: [
      /proceeds[:\s]*\$?([0-9,.]+[km]?)/i, 
      /revenue[:\s]*\$?([0-9,.]+[km]?)/i, 
      /\$([0-9,.]+[km]?)[\s]*proceeds/i,
      /proceeds\s*\n?\s*\$?([0-9,.]+[km]?)/i
    ],
    aliases: ['revenue', 'sales', 'income'],
    unit: 'currency',
    calculateFrom: {
      inputs: ['downloads', 'arpu'],
      formula: (downloads: number, arpu: number) => downloads * arpu
    }
  },
  crashes: {
    patterns: [
      /crashes?[:\s]+([0-9,.]+)/i, 
      /([0-9,.]+)[\s]*crashes/i, 
      /crash count[:\s]+([0-9,.]+)/i,
      /crashes\s*\n?\s*([0-9,.]+)/i
    ],
    aliases: ['app crashes', 'error count', 'failures'],
    unit: 'count',
    calculateFrom: null
  },
  sessionsPerDevice: {
    patterns: [
      /sessions per active device[:\s]+([0-9,.]+)/i,
      /([0-9,.]+)[\s]*sessions per active device/i,
      /sessions per active device\s*\n?\s*([0-9,.]+)/i
    ],
    aliases: ['sessions per user', 'active sessions'],
    unit: 'count',
    calculateFrom: null
  },
  proceedsPerUser: {
    patterns: [
      /proceeds per paying user[:\s]+\$?([0-9,.]+)/i,
      /\$?([0-9,.]+)[\s]*proceeds per paying user/i,
      /proceeds per paying user\s*\n?\s*\$?([0-9,.]+)/i
    ],
    aliases: ['revenue per user', 'arpu', 'average revenue per user'],
    unit: 'currency',
    calculateFrom: null
  },
  crashRate: {
    patterns: [
      /crash rate[:\s]+([0-9,.]+)%/i,
      /([0-9,.]+)%[\s]*crash rate/i
    ],
    aliases: ['error rate', 'app crash rate'],
    unit: 'percentage',
    calculateFrom: null
  }
};

// Enhanced change patterns for percent changes with more variations
export const changeSchema = {
  impressionsChange: {
    patternTypes: [
      { pattern: /impressions.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /impressions.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /impressions.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /impressions\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /impressions\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'impressions'
  },
  pageViewsChange: {
    patternTypes: [
      { pattern: /page views.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /page views.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /page views.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /product page views\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /product page views\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'pageViews'
  },
  downloadsChange: {
    patternTypes: [
      { pattern: /downloads.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /downloads.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /downloads.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /total downloads\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /total downloads\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'downloads'
  },
  conversionRateChange: {
    patternTypes: [
      { pattern: /conversion rate.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /conversion.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /conversion rate.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /conversion rate\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /conversion rate\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'conversionRate'
  },
  proceedsChange: {
    patternTypes: [
      { pattern: /proceeds.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /revenue.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /proceeds.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /proceeds.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /proceeds\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /proceeds\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'proceeds'
  },
  crashesChange: {
    patternTypes: [
      { pattern: /crashes.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /crashes.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /crashes.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /crashes\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /crashes\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'crashes'
  },
  sessionsPerDeviceChange: {
    patternTypes: [
      { pattern: /sessions per active device.*?\((an? )?(increase|decrease) of\s*([\d.]+)%\)/i, directionGroup: 2, valueGroup: 3 },
      { pattern: /sessions per active device.*?(increased|decreased) by\s*([\d.]+)%/i, directionGroup: 1, valueGroup: 2 },
      { pattern: /sessions per active device.*?([+-][\d.]+)%/i, directionGroup: null, valueGroup: 1 },
      { pattern: /sessions per active device\s*\n?.*?\+(\d+)%/i, directionGroup: null, valueGroup: 1, isPositive: true },
      { pattern: /sessions per active device\s*\n?.*?-(\d+)%/i, directionGroup: null, valueGroup: 1, isNegative: true }
    ],
    baseMetric: 'sessionsPerDevice'
  }
};

// Improved retention patterns with better benchmark extraction
export const retentionPatterns = {
  day1: {
    pattern: /day 1 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 1 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i,
    percentilePatterns: {
      p25: /day 1.*?25th.*?~([\d.]+)%/i,
      p50: /day 1.*?50th.*?~([\d.]+)%/i,
      p75: /day 1.*?75th.*?~([\d.]+)%/i
    }
  },
  day7: {
    pattern: /day 7 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 7 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i,
    percentilePatterns: {
      p25: /day 7.*?25th.*?~([\d.]+)%/i,
      p50: /day 7.*?50th.*?~([\d.]+)%/i,
      p75: /day 7.*?75th.*?~([\d.]+)%/i
    }
  },
  day14: {
    pattern: /day 14 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 14 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i
  },
  day28: {
    pattern: /day 28 retention.*?([\d.]+)%/i,
    benchmarkPattern: /day 28 retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i,
    percentilePatterns: {
      p25: /day 28.*?25th.*?~([\d.]+)%/i,
      p50: /day 28.*?50th.*?~([\d.]+)%/i,
      p75: /day 28.*?75th.*?~([\d.]+)%/i
    }
  }
};

// Source extraction patterns
export const sourcePatterns = {
  pattern: /Total Downloads by Source[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
  itemPattern: /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/i
};

// Device extraction patterns
export const devicePatterns = {
  pattern: /Total Downloads by Device[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
  itemPattern: /([A-Za-z\s]+)\s+([0-9.]+%)\s+([0-9,]+)/i
};

// Territory extraction patterns
export const territoryPatterns = {
  pattern: /Total Downloads by Territory[\s\S]*?See All([\s\S]*?)(?=Total Downloads|$)/i,
  itemPattern: /([A-Za-z\s]+)\s+([0-9,]+)/i
};

// Benchmark extraction patterns
export const benchmarkPatterns = {
  conversionRate: {
    pattern: /Your conversion rate of ([\d.]+)% is.*?(\d+)(?:th|st|nd|rd) (?:and|to) (\d+)(?:th|st|nd|rd)/i,
    percentiles: {
      p25: /conversion rate.*?25th.*?~([\d.]+)%/i,
      p50: /conversion rate.*?50th.*?~([\d.]+)%/i,
      p75: /conversion rate.*?75th.*?~([\d.]+)%/i
    }
  },
  proceedsPerUser: {
    pattern: /Your proceeds per paying user.*?\$([\d.]+) is (above|below|between)/i,
    percentiles: {
      p25: /proceeds per paying user.*?25th.*?~\$([\d.]+)/i,
      p50: /proceeds per paying user.*?50th.*?~\$([\d.]+)/i,
      p75: /proceeds per paying user.*?75th.*?~\$([\d.]+)/i
    }
  },
  crashRate: {
    pattern: /Your crash rate of ([\d.]+)% is (above|below|between)/i,
    percentiles: {
      p25: /crash rate.*?25th.*?~([\d.]+)%/i,
      p50: /crash rate.*?50th.*?~([\d.]+)%/i,
      p75: /crash rate.*?75th.*?~([\d.]+)%/i
    }
  }
};
