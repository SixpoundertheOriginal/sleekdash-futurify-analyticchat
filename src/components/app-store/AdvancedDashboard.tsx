
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DateRange } from "@/components/chat/DateRangePicker";
import { LoadingOverlay } from "./LoadingOverlay";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { useDashboardState } from "@/hooks/useDashboardState";

interface AdvancedDashboardProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AdvancedDashboard({ 
  data, 
  dateRange, 
  isLoading = false,
  onRefresh
}: AdvancedDashboardProps) {
  const { activeTab, setActiveTab, formattedDateRange } = useDashboardState({
    data,
    dateRange
  });
  
  return (
    <div className="space-y-6 relative">
      {isLoading && <LoadingOverlay message="Refreshing dashboard data..." />}
      
      <DashboardHeader 
        title={data?.summary?.title || "App Analytics Dashboard"} 
        dateRange={dateRange}
        formattedDateRange={formattedDateRange}
        onRefresh={onRefresh}
      />
      
      <DashboardTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        data={data} 
      />
    </div>
  );
}
