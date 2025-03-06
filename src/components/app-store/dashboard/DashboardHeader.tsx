
import { Button } from "@/components/ui/button";
import { RefreshCcw, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useToast } from "@/components/ui/use-toast";
import { CustomDateRangePicker } from "../CustomDateRangePicker";
import { useDevice } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  title: string;
  dateRange: DateRange | null;
  formattedDateRange: string;
  onDateRangeChange?: (dateRange: DateRange | null) => void;
  onRefresh?: () => void;
}

export function DashboardHeader({ 
  title, 
  dateRange, 
  formattedDateRange,
  onDateRangeChange,
  onRefresh
}: DashboardHeaderProps) {
  const { toast } = useToast();
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Dashboard data is being updated..."
    });
    
    // Call the refresh callback if provided
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {isMobile ? (title.length > 20 ? title.substring(0, 20) + '...' : title) : (title || "App Store Analytics")}
        </h2>
        <p className="text-sm sm:text-base font-mono text-white/60 flex items-center gap-1 tabular-nums">
          <Calendar className="h-3 w-3" />
          {isMobile ? (formattedDateRange.length > 25 ? formattedDateRange.substring(0, 25) + '...' : formattedDateRange) : formattedDateRange}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        {onDateRangeChange && (
          <CustomDateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            className="w-full sm:w-auto"
          />
        )}
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          onClick={handleRefresh}
          className="bg-white/5 text-white hover:bg-white/10 border-white/10 font-display"
        >
          <RefreshCcw className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Refresh Data</span>}
        </Button>
      </div>
    </div>
  );
}
