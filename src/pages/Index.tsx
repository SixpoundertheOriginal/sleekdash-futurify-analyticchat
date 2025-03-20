
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppStoreAnalysis } from "@/components/app-store/AppStoreAnalysis";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { getAnalyticsFromStorage } from "@/utils/analytics/storage";
import { useEffect, useState } from "react";
import { useDevice } from "@/hooks/use-mobile";
import { ThreadProvider } from "@/contexts/thread/ThreadContext";

// Enhanced initial data for demonstration purposes
const demoData: ProcessedAnalytics = {
  summary: {
    title: "App Analytics Dashboard",
    dateRange: "Sample Visualization Data",
    executiveSummary: "This is a demonstration of the analytics dashboard with sample data."
  },
  acquisition: {
    impressions: { value: 1850000, change: 12.5 },
    pageViews: { value: 425000, change: 9.8 },
    conversionRate: { value: 3.9, change: 7.2 },
    downloads: { value: 85400, change: 15.3 },
    funnelMetrics: {
      impressionsToViews: 23.0,
      viewsToDownloads: 20.1
    }
  },
  financial: {
    proceeds: { value: 175800, change: 18.7 },
    proceedsPerUser: { value: 2.06, change: 3.5 },
    derivedMetrics: {
      arpd: 2.06,
      revenuePerImpression: 0.095,
      monetizationEfficiency: 72.5,
      payingUserPercentage: 9.8
    }
  },
  engagement: {
    sessionsPerDevice: { value: 4.9, change: 6.3 },
    retention: {
      day1: { value: 38.5, benchmark: 32.0 },
      day7: { value: 25.4, benchmark: 19.5 },
      day14: { value: 18.7, benchmark: 15.0 }
    }
  },
  technical: {
    crashes: { value: 53, change: -25.8 },
    crashRate: { value: 0.12, percentile: "top 25%" },
    crashFreeUsers: { value: 99.88, change: 25.8, formatted: "99.88%" }
  },
  geographical: {
    markets: [
      { country: "United States", downloads: 37860, percentage: 44.3 },
      { country: "United Kingdom", downloads: 17080, percentage: 20.0 },
      { country: "Germany", downloads: 12380, percentage: 14.5 },
      { country: "Japan", downloads: 10250, percentage: 12.0 },
      { country: "Other", downloads: 7830, percentage: 9.2 }
    ],
    devices: [
      { type: "iPhone", count: 58970, percentage: 69.1 },
      { type: "iPad", count: 25620, percentage: 30.0 },
      { type: "iPod", count: 810, percentage: 0.9 }
    ],
    sources: [
      { source: "App Store Search", percentage: 88.6, downloads: 2994 },
      { source: "App Store Browse", percentage: 6.2, downloads: 210 },
      { source: "Institutional Purchase", percentage: 3.0, downloads: 100 },
      { source: "Unavailable", percentage: 1.2, downloads: 41 },
      { source: "App Referrer", percentage: 0.9, downloads: 29 }
    ]
  }
};

const Index = () => {
  const [initialData, setInitialData] = useState<ProcessedAnalytics>(demoData);
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';

  // Check for stored analytics data on page load
  useEffect(() => {
    const storedData = getAnalyticsFromStorage();
    if (storedData) {
      setInitialData(storedData);
    }
  }, []);

  return (
    <SidebarProvider>
      <ThreadProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
          <AppSidebar />
          <main className="flex-1 p-3 sm:p-6 animate-fade-up overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              <header className="text-white space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  App Store Analytics Dashboard
                </h1>
                <p className="text-sm sm:text-base text-white/60">
                  Monitor your app's performance and optimize your marketing strategy
                </p>
              </header>

              <div className="space-y-4 sm:space-y-6">
                <AppStoreAnalysis initialData={initialData} />
              </div>
            </div>
          </main>
        </div>
      </ThreadProvider>
    </SidebarProvider>
  );
};

export default Index;
