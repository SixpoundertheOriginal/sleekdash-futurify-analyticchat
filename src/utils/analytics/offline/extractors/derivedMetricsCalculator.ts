
/**
 * Calculator for derived metrics based on extracted raw metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Calculate derived metrics based on raw metrics
 */
export const calculateDerivedMetrics = (result: Partial<ProcessedAnalytics>): Partial<ProcessedAnalytics> => {
  // Calculate acquisition funnel metrics
  if (result.acquisition) {
    // Impressions to views rate
    if (result.acquisition.impressions?.value > 0 && result.acquisition.pageViews?.value > 0) {
      result.acquisition.funnelMetrics = result.acquisition.funnelMetrics || { impressionsToViews: 0, viewsToDownloads: 0 };
      result.acquisition.funnelMetrics.impressionsToViews = 
        (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
      console.log('Calculated impressions to views:', result.acquisition.funnelMetrics.impressionsToViews);
    }
    
    // Views to downloads rate
    if (result.acquisition.pageViews?.value > 0 && result.acquisition.downloads?.value > 0) {
      result.acquisition.funnelMetrics = result.acquisition.funnelMetrics || { impressionsToViews: 0, viewsToDownloads: 0 };
      result.acquisition.funnelMetrics.viewsToDownloads = 
        (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
      console.log('Calculated views to downloads:', result.acquisition.funnelMetrics.viewsToDownloads);
    }
  }
  
  // Calculate financial derived metrics
  if (result.financial && result.acquisition) {
    result.financial.derivedMetrics = result.financial.derivedMetrics || {
      arpd: 0,
      revenuePerImpression: 0,
      monetizationEfficiency: 0,
      payingUserPercentage: 0
    };
    
    // Average Revenue Per Download (ARPD)
    if (result.financial.proceeds?.value > 0 && result.acquisition.downloads?.value > 0) {
      result.financial.derivedMetrics.arpd = 
        result.financial.proceeds.value / result.acquisition.downloads.value;
      console.log('Calculated ARPD:', result.financial.derivedMetrics.arpd);
    }
    
    // Revenue per impression
    if (result.financial.proceeds?.value > 0 && result.acquisition.impressions?.value > 0) {
      result.financial.derivedMetrics.revenuePerImpression = 
        result.financial.proceeds.value / result.acquisition.impressions.value;
      console.log('Calculated revenue per impression:', result.financial.derivedMetrics.revenuePerImpression);
    }
    
    // Monetization efficiency (revenue per page view)
    if (result.financial.proceeds?.value > 0 && result.acquisition.pageViews?.value > 0) {
      result.financial.derivedMetrics.monetizationEfficiency = 
        result.financial.proceeds.value / result.acquisition.pageViews.value;
      console.log('Calculated monetization efficiency:', result.financial.derivedMetrics.monetizationEfficiency);
    }
  }
  
  // Calculate technical derived metrics
  if (result.technical) {
    // Crash-free users percentage
    if (result.technical.crashRate?.value > 0) {
      result.technical.crashFreeUsers = result.technical.crashFreeUsers || { value: 0, change: 0 };
      result.technical.crashFreeUsers.value = 100 - result.technical.crashRate.value;
      // Inverse relationship: if crashes up, crash-free users down
      result.technical.crashFreeUsers.change = result.technical.crashes?.change ? -result.technical.crashes.change : 0;
      console.log('Calculated crash-free users:', result.technical.crashFreeUsers);
    } else if (result.technical.crashes?.value > 0) {
      // Fallback calculation if we only have total crashes
      const estimatedActiveUsers = result.acquisition?.downloads?.value || 100000; // Use downloads or default estimate
      const crashRate = (result.technical.crashes.value / estimatedActiveUsers) * 100;
      result.technical.crashFreeUsers = result.technical.crashFreeUsers || { value: 0, change: 0 };
      result.technical.crashFreeUsers.value = 100 - Math.min(crashRate, 100);
      result.technical.crashFreeUsers.change = result.technical.crashes.change ? -result.technical.crashes.change : 0;
      console.log('Calculated estimated crash-free users:', result.technical.crashFreeUsers);
    }
  }
  
  return result;
};
