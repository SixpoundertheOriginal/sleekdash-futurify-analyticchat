
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { AppStoreAnalysis } from "@/components/AppStoreAnalysis";
import { KeywordsSection } from "@/components/KeywordsSection";
import { BarChart } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

const initialData: ProcessedAnalytics = {
  summary: {
    title: "App Analytics Dashboard",
    dateRange: "No data analyzed yet",
    executiveSummary: ""
  },
  acquisition: {
    impressions: { value: 0, change: 0 },
    pageViews: { value: 0, change: 0 },
    conversionRate: { value: 0, change: 0 },
    downloads: { value: 0, change: 0 },
    funnelMetrics: {
      impressionsToViews: 0,
      viewsToDownloads: 0
    }
  },
  financial: {
    proceeds: { value: 0, change: 0 },
    proceedsPerUser: { value: 0, change: 0 },
    derivedMetrics: {
      arpd: 0,
      revenuePerImpression: 0,
      monetizationEfficiency: 0,
      payingUserPercentage: 0
    }
  },
  engagement: {
    sessionsPerDevice: { value: 0, change: 0 },
    retention: {
      day1: { value: 0, benchmark: 0 },
      day7: { value: 0, benchmark: 0 }
    }
  },
  technical: {
    crashes: { value: 0, change: 0 },
    crashRate: { value: 0, percentile: "" }
  },
  geographical: {
    markets: [],
    devices: []
  }
};

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="text-white space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                App Store Analytics Dashboard
              </h1>
              <p className="text-white/60">
                Monitor your app's performance and optimize your marketing strategy
              </p>
            </header>

            <div className="space-y-6">
              <AppStoreAnalysis initialData={initialData} />
            </div>

            <KeywordsSection />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
