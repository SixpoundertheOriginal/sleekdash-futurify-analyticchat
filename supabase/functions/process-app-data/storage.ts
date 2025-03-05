
// Helper functions for storing processed data in Supabase

/**
 * Store processed analytics data in Supabase database
 */
export async function storeAnalyticsData(
  client,
  dateRange: string, 
  metrics: Record<string, any>
) {
  try {
    // Extract main metrics
    const {
      impressions,
      pageViews,
      downloads,
      conversionRate,
      proceeds,
      sessionPerDevice,
      crashes
    } = metrics;
    
    // Extract change metrics
    const {
      impressionsChange,
      pageViewsChange,
      downloadsChange,
      conversionRateChange,
      proceedsChange,
      crashesChange,
    } = metrics.changes || {};
    
    // Format growth data for storage
    const growthMetrics = {
      impressions: impressionsChange || 0,
      pageViews: pageViewsChange || 0,
      downloads: downloadsChange || 0,
      conversionRate: conversionRateChange || 0,
      proceeds: proceedsChange || 0,
      crashes: crashesChange || 0
    };
    
    // Store in Supabase
    const { data, error } = await client
      .from('app_analytics')
      .insert({
        date_range: dateRange,
        impressions: impressions || 0,
        page_views: pageViews || 0,
        conversion_rate: conversionRate || 0, 
        downloads: downloads || 0,
        proceeds: proceeds || 0,
        crashes: crashes || 0,
        growth_metrics: growthMetrics,
        raw_metrics: metrics,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error storing analytics data:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in storeAnalyticsData:', error);
    return { success: false, error };
  }
}
