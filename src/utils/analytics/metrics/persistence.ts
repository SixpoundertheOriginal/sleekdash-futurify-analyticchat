
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { MetricExtractor } from "../metricTypes";

/**
 * Store processed analytics data in Supabase for historical tracking
 */
export async function storeAnalyticsData(metrics: Record<string, any>, dateRange: string) {
  try {
    // Generate a timestamp for the stored data
    const timestamp = new Date().toISOString();
    
    // Extract growth values from metrics
    const growthValues = {
      impressionsGrowth: metrics.impressionsChange || 0,
      pageViewsGrowth: metrics.pageViewsChange || 0,
      conversionRateGrowth: metrics.conversionRateChange || 0,
      downloadsGrowth: metrics.downloadsChange || 0,
      proceedsGrowth: metrics.proceedsChange || 0
    };
    
    // Insert the metrics data to Supabase
    const { data, error } = await supabase
      .from('app_analytics')
      .insert({
        date_range: dateRange,
        impressions: metrics.impressions || 0,
        page_views: metrics.pageViews || 0,
        conversion_rate: metrics.conversionRate || 0,
        downloads: metrics.downloads || 0, 
        proceeds: metrics.proceeds || 0,
        growth_metrics: growthValues,
        raw_metrics: metrics,
        timestamp: timestamp
      });
      
    if (error) {
      console.error('Error storing analytics data:', error);
      return false;
    }
    
    console.log('Analytics data stored successfully');
    return true;
  } catch (error) {
    console.error('Error in storeAnalyticsData:', error);
    return false;
  }
}

/**
 * Retrieve historical analytics data
 */
export async function getHistoricalAnalytics(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('app_analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error retrieving historical analytics:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getHistoricalAnalytics:', error);
    return null;
  }
}

/**
 * Get the most recent analytics entry
 */
export async function getLatestAnalytics() {
  const data = await getHistoricalAnalytics(1);
  return data && data.length > 0 ? data[0] : null;
}
