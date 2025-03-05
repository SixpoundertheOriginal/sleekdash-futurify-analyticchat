
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  isDateRangeSelected: boolean;
}

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  isDateRangeSelected
}: DateRangeSelectorProps) {
  return (
    <div className="my-2 p-3 rounded-lg border border-white/10 bg-white/5">
      <h3 className="text-sm font-medium mb-2 text-white/80">Analysis Date Range</h3>
      <div className="text-xs text-white/60 mb-2">
        {isDateRangeSelected && dateRange?.from && dateRange?.to ? (
          <span>
            Selected: {format(dateRange.from, "MMMM d, yyyy")} - {format(dateRange.to, "MMMM d, yyyy")}
          </span>
        ) : (
          <span>Please select a date range for your analysis</span>
        )}
      </div>
      {/* The actual DateRangePicker component would be rendered here, 
          but it's not being implemented in this refactor since it already exists */}
    </div>
  );
}
