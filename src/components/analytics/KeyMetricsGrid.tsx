
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { ProcessedAnalytics, formatMetric } from "@/utils/analytics/processAnalysis";

interface KeyMetricsGridProps {
  data: ProcessedAnalytics;
}

export function KeyMetricsGrid({ data }: KeyMetricsGridProps) {
  // Enhanced demonstration metrics for visual presentation
  const metrics = [
    {
      title: "Total Downloads",
      value: 128750,
      change: 18.5,
      format: "number"
    },
    {
      title: "Total Proceeds",
      value: 284900,
      change: 24.2,
      format: "currency"
    },
    {
      title: "Impressions",
      value: 2500000,
      change: 15.3,
      format: "number"
    },
    {
      title: "Conversion Rate",
      value: 4.8,
      change: 12.7,
      format: "percentage"
    },
    {
      title: "Crash Count",
      value: 42,
      change: -32.5,
      format: "number",
      // Special flag to indicate that negative change is positive for this metric
      inverseColor: true
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => {
        // Determine if this is a "positive" change (using inverseColor for crash metrics)
        const isPositiveChange = metric.inverseColor 
          ? metric.change < 0 
          : metric.change > 0;
        
        // For metrics like crash count, a decrease is good, so we show it in green
        const displayPositiveColor = metric.inverseColor 
          ? metric.change < 0  // For inverse metrics, negative change is good
          : metric.change > 0; // For regular metrics, positive change is good
        
        return (
          <Card 
            key={index} 
            className="p-6 glass-card hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-display text-sm text-white/60">{metric.title}</p>
                <h3 className="font-display text-2xl font-semibold gradient-text mt-1 tabular-nums">
                  {formatMetric(metric.value, metric.format as any)}
                </h3>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                displayPositiveColor ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
              }`}>
                {metric.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="font-mono text-xs font-medium tabular-nums max-w-[50px] truncate">{Math.abs(metric.change)}%</span>
              </div>
            </div>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${displayPositiveColor ? 'bg-emerald-400' : 'bg-rose-400'}`}
                style={{ width: `${Math.min(Math.abs(metric.change), 100)}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
