
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InfoIcon, RefreshCcw, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";
import { GlobalMetrics } from "./metrics/GlobalMetrics";
import { AcquisitionPanel } from "./metrics/AcquisitionPanel";
import { RevenuePanel } from "./metrics/RevenuePanel";
import { UserRetentionPanel } from "./metrics/UserRetentionPanel";
import { PerformancePanel } from "./metrics/PerformancePanel";
import { CompetitiveAnalysis } from "./metrics/CompetitiveAnalysis";
import { SourcesBreakdown } from "./metrics/SourcesBreakdown";
import { GeographicalDistribution } from "./metrics/GeographicalDistribution";
import { DeviceDistribution } from "./metrics/DeviceDistribution";
import { LongTermTrends } from "./metrics/LongTermTrends";
import { ExecutiveSummary } from "./metrics/ExecutiveSummary";

interface AdvancedDashboardProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
  isLoading?: boolean;
}

export function AdvancedDashboard({ data, dateRange, isLoading = false }: AdvancedDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  
  // Format date range for display
  const formattedDateRange = dateRange 
    ? `${format(dateRange.from, "LLL dd, yyyy")} - ${format(dateRange.to, "LLL dd, yyyy")}`
    : data.summary.dateRange || "Not specified";
    
  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Dashboard data is being updated..."
    });
    // Implementation would go here
  };

  return (
    <div className="space-y-6 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {data.summary.title || "App Store Analytics"}
          </h2>
          <p className="text-white/60">{formattedDateRange}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          className="bg-white/5 text-white hover:bg-white/10 border-white/10"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      {/* Executive Summary Card */}
      <ExecutiveSummary 
        title={data.summary.title}
        summary={data.summary.executiveSummary}
        dateRange={formattedDateRange}
        data={data}
      />
      
      {/* Global Metrics Overview */}
      <GlobalMetrics data={data} isLoading={isLoading} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 bg-white/5 p-1 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AcquisitionPanel data={data} compact />
            <RevenuePanel data={data} compact />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserRetentionPanel data={data} compact />
            <PerformancePanel data={data} compact />
          </div>
        </TabsContent>
        
        <TabsContent value="acquisition" className="pt-4 space-y-6">
          <AcquisitionPanel data={data} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SourcesBreakdown data={data} />
            <GeographicalDistribution data={data} />
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="pt-4 space-y-6">
          <RevenuePanel data={data} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/5 border-white/10">
              <h3 className="font-semibold text-white mb-4">Revenue per Download Trend</h3>
              <div className="h-[250px] flex items-center justify-center text-white/60">
                <BarChart3 className="h-6 w-6 mr-2" />
                Advanced revenue per download visualization would appear here
              </div>
            </Card>
            <DeviceDistribution data={data} />
          </div>
        </TabsContent>
        
        <TabsContent value="engagement" className="pt-4 space-y-6">
          <UserRetentionPanel data={data} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/5 border-white/10">
              <h3 className="font-semibold text-white mb-4">Session Depth Analysis</h3>
              <div className="h-[250px] flex items-center justify-center text-white/60">
                <Activity className="h-6 w-6 mr-2" />
                Session depth and duration analysis would appear here
              </div>
            </Card>
            <LongTermTrends data={data} metric="retention" />
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="pt-4 space-y-6">
          <PerformancePanel data={data} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompetitiveAnalysis data={data} />
            <LongTermTrends data={data} metric="crashes" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
