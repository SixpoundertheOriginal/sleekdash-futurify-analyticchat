
import { useState } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";

interface UseDashboardStateProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
}

export function useDashboardState({ data, dateRange }: UseDashboardStateProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Format date range for display
  const formattedDateRange = dateRange 
    ? `${format(dateRange.from, "LLL dd, yyyy")} - ${format(dateRange.to, "LLL dd, yyyy")}`
    : data.summary.dateRange || "Not specified";

  return {
    activeTab,
    setActiveTab,
    formattedDateRange
  };
}
