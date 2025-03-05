import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "@/components/chat/DateRangePicker";
import { Label } from "@/components/ui/label";

const datePresets = [
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Last quarter", value: "quarter" },
  { label: "Year to date", value: "ytd" },
  { label: "Custom", value: "custom" },
];

interface CustomDateRangePickerProps {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  label?: string;
  className?: string;
}

export function CustomDateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  label = "Select Date Range",
  className
}: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    const now = new Date();
    
    switch (value) {
      case "7days": {
        const from = new Date();
        from.setDate(now.getDate() - 7);
        onDateRangeChange({ from, to: now });
        break;
      }
      case "30days": {
        const from = new Date();
        from.setDate(now.getDate() - 30);
        onDateRangeChange({ from, to: now });
        break;
      }
      case "quarter": {
        const from = new Date();
        from.setMonth(now.getMonth() - 3);
        onDateRangeChange({ from, to: now });
        break;
      }
      case "ytd": {
        const from = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
        onDateRangeChange({ from, to: now });
        break;
      }
      case "custom":
        // Keep current selection or set a default
        if (!dateRange) {
          const from = new Date();
          from.setDate(now.getDate() - 7);
          onDateRangeChange({ from, to: now });
        }
        break;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-white font-medium">{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full bg-white/5 border-white/10 hover:bg-white/10",
              !dateRange && "text-white/50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-zinc-950 border-white/10" align="start">
          <div className="space-y-2 p-2">
            <Select 
              onValueChange={handlePresetChange}
              defaultValue="custom"
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10">
                {datePresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <div className="space-y-1">
                <div className="text-xs text-center text-white/60">From</div>
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => onDateRangeChange({ 
                    from: date || new Date(), 
                    to: dateRange?.to || new Date() 
                  })}
                  className="rounded-md border border-white/10 bg-zinc-950 pointer-events-auto"
                  disabled={(date) => date > new Date()}
                  components={{
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-center text-white/60">To</div>
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(date) => onDateRangeChange({ 
                    from: dateRange?.from || new Date(), 
                    to: date || new Date() 
                  })}
                  className="rounded-md border border-white/10 bg-zinc-950 pointer-events-auto"
                  disabled={(date) => 
                    date > new Date() || 
                    (dateRange?.from ? date < dateRange.from : false)
                  }
                  components={{
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsOpen(false)}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
