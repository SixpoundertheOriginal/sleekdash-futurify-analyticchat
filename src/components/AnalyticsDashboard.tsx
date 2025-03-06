
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { KeyMetricsGrid } from "./analytics/KeyMetricsGrid";
import { ConversionFunnel } from "./analytics/ConversionFunnel";
import { GeographicalDistribution } from "./analytics/GeographicalDistribution";
import { RetentionChart } from "./analytics/RetentionChart";
import { TrendAnalysis } from "./analytics/TrendAnalysis";
import { PredictiveMetrics } from "./analytics/PredictiveMetrics";
import { ComparativeAnalysis } from "./analytics/ComparativeAnalysis";
import { ImpressionAnalytics } from "./analytics/ImpressionAnalytics";
import { ProceedsAnalysis } from "./analytics/ProceedsAnalysis";
import { EngagementMetrics } from "./analytics/EngagementMetrics";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";
import { CollapsibleSection } from "./analytics/CollapsibleSection";
import { useDevice } from "@/hooks/use-mobile";

interface AnalyticsDashboardProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
}

export function AnalyticsDashboard({ data, dateRange }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  
  // Format the selected date range for display
  const formattedDateRange = dateRange 
    ? `${format(dateRange.from, "LLL dd, yyyy")} - ${format(dateRange.to, "LLL dd, yyyy")}`
    : "Not specified";
  
  // Enhanced demo data for visualization
  const demoData: ProcessedAnalytics = {
    ...data,
    summary: {
      title: "App Analytics Dashboard Demo",
      dateRange: dateRange ? formattedDateRange : "Last 30 days (Jan 1 - Jan 30, 2023)",
      executiveSummary: "Strong performance with 18.5% growth in downloads and 24.2% increase in revenue."
    },
    acquisition: {
      impressions: { value: 2500000, change: 15.3 },
      pageViews: { value: 580000, change: 12.8 },
      conversionRate: { value: 4.8, change: 12.7 },
      downloads: { value: 128750, change: 18.5 },
      funnelMetrics: {
        impressionsToViews: 23.2,
        viewsToDownloads: 22.2
      }
    },
    financial: {
      proceeds: { value: 284900, change: 24.2 },
      proceedsPerUser: { value: 2.21, change: 5.7 },
      derivedMetrics: {
        arpd: 2.21,
        revenuePerImpression: 0.114,
        monetizationEfficiency: 78.3,
        payingUserPercentage: 12.5
      }
    },
    engagement: {
      sessionsPerDevice: { value: 5.8, change: 8.2 },
      retention: {
        day1: { value: 42.5, benchmark: 35.0 },
        day7: { value: 28.3, benchmark: 22.0 },
        day14: { value: 22.1, benchmark: 18.5 }
      }
    },
    technical: {
      crashes: { value: 42, change: -32.5 },
      crashRate: { value: 0.08, percentile: "top 15%" }
    },
    geographical: {
      markets: [
        { country: "United States", downloads: 58250, percentage: 45.2 },
        { country: "United Kingdom", downloads: 24320, percentage: 18.9 },
        { country: "Germany", downloads: 18540, percentage: 14.4 },
        { country: "Japan", downloads: 15450, percentage: 12.0 },
        { country: "Other", downloads: 12190, percentage: 9.5 }
      ],
      devices: [
        { type: "iPhone", count: 89230, percentage: 69.3 },
        { type: "iPad", count: 38360, percentage: 29.8 },
        { type: "iPod", count: 1160, percentage: 0.9 }
      ]
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast({
        title: "Dashboard Updated",
        description: "Analysis data has been refreshed"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to refresh analysis data"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">{demoData.summary.title}</h2>
          <p className="text-white/60 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {demoData.summary.dateRange}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className={`${isMobile ? 'w-[120px]' : 'w-[180px]'} bg-white/5 border-white/10 text-white`}>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Always show key metrics as they provide the essential overview */}
      <KeyMetricsGrid data={demoData} />

      <div className="space-y-6">
        <CollapsibleSection title="Predictive Analytics" defaultExpanded={!isMobile}>
          <PredictiveMetrics data={demoData} />
        </CollapsibleSection>
      </div>

      <CollapsibleSection title="Acquisition & Revenue" defaultExpanded={!isMobile}>
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <ImpressionAnalytics data={demoData} />
          <ProceedsAnalysis data={demoData} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Conversion & Geography" defaultExpanded={false}>
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <ConversionFunnel data={demoData} />
          <GeographicalDistribution data={demoData} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Trend & Competitive Analysis" defaultExpanded={false}>
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <TrendAnalysis data={demoData} />
          <ComparativeAnalysis data={demoData} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="User Engagement" defaultExpanded={false}>
        <div className="pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <EngagementMetrics data={demoData} />
            <RetentionChart data={demoData} />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
