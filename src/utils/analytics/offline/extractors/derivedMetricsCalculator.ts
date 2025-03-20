
/**
 * Calculator for derived metrics based on extracted base metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Calculate derived metrics based on extracted values
 */
export const calculateDerivedMetrics = (metrics: Partial<ProcessedAnalytics>): Partial<ProcessedAnalytics> => {
  if (!metrics) return {};
  
  // Create a deep clone to avoid modifying the original object
  const result = JSON.parse(JSON.stringify(metrics)) as Partial<ProcessedAnalytics>;
  
  // Ensure all required structures exist
  if (!result.acquisition) {
    result.acquisition = {
      downloads: { value: 0, change: 0 },
      impressions: { value: 0, change: 0 },
      pageViews: { value: 0, change: 0 },
      conversionRate: { value: 0, change: 0 },
      funnelMetrics: {
        impressionsToViews: 0,
        viewsToDownloads: 0
      },
      sources: {}
    };
  }
  
  if (!result.financial) {
    result.financial = {
      proceeds: { value: 0, change: 0 },
      proceedsPerUser: { value: 0, change: 0 },
      derivedMetrics: {
        arpd: 0,
        revenuePerImpression: 0,
        monetizationEfficiency: 0,
        payingUserPercentage: 0
      }
    };
  }
  
  if (!result.engagement) {
    result.engagement = {
      sessionsPerDevice: { value: 0, change: 0 },
      retention: { 
        day1: { value: 0, benchmark: 0 }, 
        day7: { value: 0, benchmark: 0 }, 
        day28: { value: 0, benchmark: 0 } 
      }
    };
  }
  
  if (!result.technical) {
    result.technical = {
      crashes: { value: 0, change: 0 },
      crashRate: { value: 0, percentile: "average" },
      crashFreeUsers: { value: 0, change: 0 }
    };
  }

  // Ensure structures for derived metrics exist
  if (!result.acquisition.funnelMetrics) {
    result.acquisition.funnelMetrics = {
      impressionsToViews: 0,
      viewsToDownloads: 0
    };
  }
  
  if (!result.financial.derivedMetrics) {
    result.financial.derivedMetrics = {
      arpd: 0,
      revenuePerImpression: 0,
      monetizationEfficiency: 0,
      payingUserPercentage: 0
    };
  }
  
  // Now calculate derived metrics
  
  // 1. Calculate ARPD (Average Revenue Per Download)
  if (result.acquisition?.downloads?.value > 0 && result.financial?.proceeds?.value > 0) {
    result.financial.derivedMetrics.arpd = result.financial.proceeds.value / result.acquisition.downloads.value;
    console.log('Calculated ARPD:', result.financial.derivedMetrics.arpd);
  }

  // 2. Calculate funnel metrics - impressions to views
  if (result.acquisition?.pageViews?.value > 0 && result.acquisition?.impressions?.value > 0) {
    result.acquisition.funnelMetrics.impressionsToViews = 
      (result.acquisition.pageViews.value / result.acquisition.impressions.value) * 100;
    console.log('Calculated impressions to views:', result.acquisition.funnelMetrics.impressionsToViews);
  }

  // 3. Calculate funnel metrics - views to downloads
  if (result.acquisition?.downloads?.value > 0 && result.acquisition?.pageViews?.value > 0) {
    result.acquisition.funnelMetrics.viewsToDownloads = 
      (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100;
    console.log('Calculated views to downloads:', result.acquisition.funnelMetrics.viewsToDownloads);
  }
  
  // 4. Calculate average revenue per user if not already present
  if (result.financial?.proceeds?.value > 0 && !result.financial.proceedsPerUser?.value) {
    // Estimate active users based on available metrics
    let estimatedActiveUsers = 0;
    
    if (result.acquisition?.downloads?.value) {
      // Basic estimate using downloads and typical retention
      estimatedActiveUsers = result.acquisition.downloads.value * 0.4; // Assume 40% retention as default
    }
    
    if (estimatedActiveUsers > 0) {
      result.financial.proceedsPerUser = { 
        value: result.financial.proceeds.value / estimatedActiveUsers,
        change: 0 
      };
      console.log('Calculated proceeds per user:', result.financial.proceedsPerUser.value);
    }
  }
  
  // 5. Calculate crash-free sessions percentage
  if (result.technical?.crashes?.value > 0 && result.engagement?.sessionsPerDevice?.value > 0 && 
      result.acquisition?.downloads?.value > 0) {
    // Estimate total sessions
    const estimatedTotalSessions = result.engagement.sessionsPerDevice.value * result.acquisition.downloads.value;
    
    if (estimatedTotalSessions > 0) {
      const crashFreeSessions = Math.max(0, estimatedTotalSessions - result.technical.crashes.value);
      const crashFreePercentage = (crashFreeSessions / estimatedTotalSessions) * 100;
      
      // Make sure crashFreeUsers exists in the technical object
      if (!result.technical.crashFreeUsers) {
        result.technical.crashFreeUsers = { value: 0, change: 0 };
      }
      
      result.technical.crashFreeUsers = { 
        value: crashFreePercentage,
        change: 0,
        formatted: `${crashFreePercentage.toFixed(2)}%`
      };
      console.log('Calculated crash-free percentage:', result.technical.crashFreeUsers.value);
    }
  }
  
  // 6. Calculate impressions if missing but we have pageViews and conversionRate
  if (!result.acquisition.impressions?.value && 
      result.acquisition.pageViews?.value > 0 && 
      result.acquisition.conversionRate?.value > 0) {
    
    // Impressions = Page Views / (Conversion Rate / 100)
    const conversionRateFraction = result.acquisition.conversionRate.value / 100;
    if (conversionRateFraction > 0) {
      result.acquisition.impressions = {
        value: result.acquisition.pageViews.value / conversionRateFraction,
        change: 0
      };
      console.log('Calculated missing impressions:', result.acquisition.impressions.value);
    }
  }
  
  // 7. Calculate downloads if missing but we have pageViews and conversionRate
  if (!result.acquisition.downloads?.value && 
      result.acquisition.pageViews?.value > 0 && 
      result.acquisition.conversionRate?.value > 0) {
    
    // Downloads = Page Views * (Conversion Rate / 100)
    const conversionRateFraction = result.acquisition.conversionRate.value / 100;
    result.acquisition.downloads = {
      value: result.acquisition.pageViews.value * conversionRateFraction,
      change: 0
    };
    console.log('Calculated missing downloads:', result.acquisition.downloads.value);
  }
  
  // 8. Calculate pageViews if missing but we have downloads and conversionRate
  if (!result.acquisition.pageViews?.value && 
      result.acquisition.downloads?.value > 0 && 
      result.acquisition.conversionRate?.value > 0) {
    
    // Page Views = Downloads / (Conversion Rate / 100)
    const conversionRateFraction = result.acquisition.conversionRate.value / 100;
    if (conversionRateFraction > 0) {
      result.acquisition.pageViews = {
        value: result.acquisition.downloads.value / conversionRateFraction,
        change: 0
      };
      console.log('Calculated missing pageViews:', result.acquisition.pageViews.value);
    }
  }
  
  // 9. Calculate conversionRate if missing but we have downloads and pageViews
  if (!result.acquisition.conversionRate?.value && 
      result.acquisition.downloads?.value > 0 && 
      result.acquisition.pageViews?.value > 0) {
    
    // Conversion Rate = (Downloads / Page Views) * 100
    result.acquisition.conversionRate = {
      value: (result.acquisition.downloads.value / result.acquisition.pageViews.value) * 100,
      change: 0
    };
    console.log('Calculated missing conversionRate:', result.acquisition.conversionRate.value);
  }

  return result;
};
