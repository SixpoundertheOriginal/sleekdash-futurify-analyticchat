
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { Card } from "@/components/ui/card";
import { BarChart3, PieChart, Activity } from "lucide-react";
import { AcquisitionPanel } from "../metrics/AcquisitionPanel";
import { RevenuePanel } from "../metrics/RevenuePanel";
import { UserRetentionPanel } from "../metrics/UserRetentionPanel";
import { PerformancePanel } from "../metrics/PerformancePanel";
import { CompetitiveAnalysis } from "../metrics/CompetitiveAnalysis";
import { SourcesBreakdown } from "../metrics/SourcesBreakdown";
import { GeographicalDistribution } from "../metrics/GeographicalDistribution";
import { DeviceDistribution } from "../metrics/DeviceDistribution";
import { LongTermTrends } from "../metrics/LongTermTrends";
import { useDevice } from "@/hooks/use-mobile";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  data: ProcessedAnalytics;
}

export function DashboardTabs({ activeTab, setActiveTab, data }: DashboardTabsProps) {
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  // Determine number of tabs to show based on screen size
  const tabCount = isMobile ? 3 : isTablet ? 4 : 5;
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="overflow-x-auto pb-2">
        <TabsList className={`grid ${isMobile ? 'grid-cols-3' : isTablet ? 'grid-cols-4' : 'grid-cols-5'} bg-white/5 p-1 w-full min-w-max`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          {(isTablet || !isMobile) && <TabsTrigger value="engagement">Engagement</TabsTrigger>}
          {!isMobile && !isTablet && <TabsTrigger value="performance">Performance</TabsTrigger>}
          {(isMobile || isTablet) && <TabsTrigger value="more">More</TabsTrigger>}
        </TabsList>
      </div>
      
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
      
      {(isMobile || isTablet) && (
        <TabsContent value="more" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {!isTablet && <UserRetentionPanel data={data} />}
            <PerformancePanel data={data} />
            {isMobile && (
              <CompetitiveAnalysis data={data} />
            )}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
