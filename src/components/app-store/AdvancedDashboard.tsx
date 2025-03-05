
import { Card } from "@/components/ui/card";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { GlobalMetrics } from "./metrics/GlobalMetrics";
import { ExecutiveSummary } from "./metrics/ExecutiveSummary";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { useDashboardState } from "@/hooks/useDashboardState";

interface AdvancedDashboardProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
  isLoading?: boolean;
}

export function AdvancedDashboard({ data, dateRange, isLoading = false }: AdvancedDashboardProps) {
  const { activeTab, setActiveTab, formattedDateRange } = useDashboardState({ data, dateRange });
  
  return (
    <div className="space-y-6 animate-fade">
      <DashboardHeader 
        title={data.summary.title} 
        dateRange={dateRange} 
        formattedDateRange={formattedDateRange} 
      />
      
      {/* Executive Summary Card */}
      <ExecutiveSummary 
        title={data.summary.title}
        summary={data.summary.executiveSummary}
        dateRange={formattedDateRange}
        data={data}
      />
      
      {/* Global Metrics Overview */}
      <GlobalMetrics data={data} isLoading={isLoading} />
      
      {/* Dashboard Tabs */}
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        data={data}
      />
    </div>
  );
}
