
/**
 * Visualization adapter utilities
 * Transforms domain-specific data into standardized formats for charts
 */
import { ProcessedKeywordData } from "@/components/keywords/types";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { MetricCategory } from "./standardizedMetrics";

/**
 * Standard chart data point structure that works across domains
 */
export interface StandardChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  color?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'area';
  xAxisKey: string;
  yAxisKey: string;
  category: MetricCategory;
  title: string;
  subtitle?: string;
  dataKeys: string[];
}

/**
 * Convert keyword data to standardized format for visualization
 */
export function adaptKeywordDataForVisualization(
  data: ProcessedKeywordData[],
  config: Partial<ChartConfig> = {}
): StandardChartDataPoint[] {
  if (!data || data.length === 0) return [];
  
  // Default config for keyword visualization
  const defaultConfig: ChartConfig = {
    type: 'bar',
    xAxisKey: 'keyword',
    yAxisKey: 'value',
    category: MetricCategory.OPPORTUNITY,
    title: 'Keyword Analysis',
    dataKeys: ['volume', 'difficulty', 'opportunityScore']
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  // Convert data to standard format
  return data.map(item => ({
    name: item.keyword,
    value: item[finalConfig.dataKeys[0] as keyof ProcessedKeywordData] as number,
    secondaryValue: item[finalConfig.dataKeys[1] as keyof ProcessedKeywordData] as number,
    opportunityScore: item.opportunityScore,
    volume: item.volume,
    difficulty: item.difficulty,
    chance: item.chance,
    relevancy: item.relevancy,
    kei: item.kei,
    category: finalConfig.category
  }));
}

/**
 * Convert analytics data to standardized format for visualization
 */
export function adaptAnalyticsDataForVisualization(
  data: ProcessedAnalytics,
  metricType: string,
  config: Partial<ChartConfig> = {}
): StandardChartDataPoint[] {
  if (!data) return [];
  
  // Map different metrics to their data sources
  switch (metricType) {
    case 'acquisition':
      // Format acquisition metrics
      return [
        { 
          name: 'Impressions', 
          value: data.acquisition?.impressions?.value || 0,
          change: data.acquisition?.impressions?.change || 0,
          category: MetricCategory.ACQUISITION 
        },
        { 
          name: 'Page Views', 
          value: data.acquisition?.pageViews?.value || 0,
          change: data.acquisition?.pageViews?.change || 0,
          category: MetricCategory.ACQUISITION 
        },
        { 
          name: 'Downloads', 
          value: data.acquisition?.downloads?.value || 0,
          change: data.acquisition?.downloads?.change || 0,
          category: MetricCategory.ACQUISITION 
        }
      ];
      
    case 'financial':
      // Format financial metrics
      return [
        { 
          name: 'Proceeds', 
          value: data.financial?.proceeds?.value || 0,
          change: data.financial?.proceeds?.change || 0,
          category: MetricCategory.FINANCIAL 
        },
        { 
          name: 'Proceeds Per User', 
          value: data.financial?.proceedsPerUser?.value || 0,
          change: data.financial?.proceedsPerUser?.change || 0,
          category: MetricCategory.FINANCIAL 
        }
      ];
      
    case 'geographical':
      // Format geographical data if available
      return data.geographical?.markets?.map(market => ({
        name: market.country,
        value: market.downloads || 0,
        percentage: market.percentage || 0,
        category: MetricCategory.ACQUISITION
      })) || [];
      
    default:
      return [];
  }
}

/**
 * Create data ready for dashboard cards across both domains
 */
export function createMetricCardData(
  data: ProcessedAnalytics | ProcessedKeywordData[],
  isKeywordData: boolean = false
): StandardChartDataPoint[] {
  if (isKeywordData) {
    // Handle keyword data
    const keywordData = data as ProcessedKeywordData[];
    if (!keywordData || keywordData.length === 0) return [];
    
    // Calculate some aggregate metrics
    const avgVolume = keywordData.reduce((sum, item) => sum + item.volume, 0) / keywordData.length;
    const avgDifficulty = keywordData.reduce((sum, item) => sum + item.difficulty, 0) / keywordData.length;
    const avgOpportunity = keywordData.reduce((sum, item) => sum + item.opportunityScore, 0) / keywordData.length;
    
    // Create standardized metrics
    return [
      { name: 'Average Volume', value: avgVolume, category: MetricCategory.ACQUISITION },
      { name: 'Average Difficulty', value: avgDifficulty, category: MetricCategory.PERFORMANCE },
      { name: 'Average Opportunity', value: avgOpportunity, category: MetricCategory.OPPORTUNITY },
      { name: 'Keywords Count', value: keywordData.length, category: MetricCategory.ACQUISITION }
    ];
  } else {
    // Handle analytics data
    const analyticsData = data as ProcessedAnalytics;
    if (!analyticsData) return [];
    
    // Create standardized metrics
    return [
      { 
        name: 'Downloads', 
        value: analyticsData.acquisition?.downloads?.value || 0,
        change: analyticsData.acquisition?.downloads?.change || 0,
        category: MetricCategory.ACQUISITION 
      },
      { 
        name: 'Proceeds', 
        value: analyticsData.financial?.proceeds?.value || 0,
        change: analyticsData.financial?.proceeds?.change || 0,
        category: MetricCategory.FINANCIAL 
      },
      { 
        name: 'Conversion Rate', 
        value: analyticsData.acquisition?.conversionRate?.value || 0,
        change: analyticsData.acquisition?.conversionRate?.change || 0,
        category: MetricCategory.PERFORMANCE 
      },
      { 
        name: 'Crashes', 
        value: analyticsData.technical?.crashes?.value || 0,
        change: analyticsData.technical?.crashes?.change || 0,
        category: MetricCategory.TECHNICAL,
        inverseColors: true
      }
    ];
  }
}
