
import { Card } from "@/components/ui/card";
import { formatMetric } from "@/utils/analytics/formatting";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  format: "number" | "currency" | "percentage";
  inverseColor?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format,
  inverseColor = false 
}: MetricCardProps) {
  // Skip rendering if we don't have a value for this metric
  if (value === 0) {
    return (
      <Card className="p-4 bg-white/5 hover:bg-white/10 transition-all border-white/10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-white/70" />
              <span className="text-sm text-white/70">{title}</span>
            </div>
            <span className="text-xl font-semibold text-white/50 mt-1">
              No data
            </span>
          </div>
          <div className="px-2 py-1 rounded-full text-xs text-white/40 bg-white/10">
            N/A
          </div>
        </div>
        
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden" />
      </Card>
    );
  }

  const displayPositiveColor = inverseColor 
    ? change < 0 
    : change > 0;
    
  return (
    <Card className="p-4 bg-white/5 hover:bg-white/10 transition-all border-white/10">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white/70">{title}</span>
          </div>
          <span className="text-xl font-semibold text-white mt-1">
            {formatMetric(value, format)}
          </span>
        </div>
        <div 
          className={`flex items-center px-2 py-1 rounded-full text-xs ${
            displayPositiveColor 
              ? 'text-emerald-400 bg-emerald-500/10' 
              : 'text-rose-400 bg-rose-500/10'
          }`}
        >
          {change >= 0 ? '+' : ''}{change}%
        </div>
      </div>
      
      <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${displayPositiveColor ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
        />
      </div>
    </Card>
  );
}
