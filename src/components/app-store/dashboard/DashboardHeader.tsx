
import { Button } from "@/components/ui/button";
import { RefreshCcw, Activity } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "@/components/chat/DateRangePicker";
import { useToast } from "@/components/ui/use-toast";
import { CustomDateRangePicker } from "../CustomDateRangePicker";

interface DashboardHeaderProps {
  title: string;
  dateRange: DateRange | null;
  formattedDateRange: string;
  onDateRangeChange?: (dateRange: DateRange | null) => void;
}

export function DashboardHeader({ 
  title, 
  dateRange, 
  formattedDateRange,
  onDateRangeChange
}: DashboardHeaderProps) {
  const { toast } = useToast();
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Dashboard data is being updated..."
    });
    // Implementation would go here
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {title || "App Store Analytics"}
        </h2>
        <p className="text-white/60">{formattedDateRange}</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {onDateRangeChange && (
          <CustomDateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            className="w-full md:w-auto"
          />
        )}
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
    </div>
  );
}
