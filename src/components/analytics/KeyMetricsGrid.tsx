
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { formatMetric } from "@/utils/analytics/processAnalysis";

interface KeyMetricsGridProps {
  data: ProcessedAnalytics;
}

export function KeyMetricsGrid({ data }: KeyMetricsGridProps) {
  // Enhanced dummy metrics for presentation
  const metrics = [
    {
      title: "Total Downloads",
      value: 12875,
      change: 18.5,
      format: "number"
    },
    {
      title: "Total Proceeds",
      value: 28490,
      change: 24.2,
      format: "currency"
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
      format: "number"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className="p-6 glass-card hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60">{metric.title}</p>
              <h3 className="text-2xl font-semibold gradient-text mt-1">
                {formatMetric(metric.value, metric.format as any)}
              </h3>
            </div>
            <div className={`flex items-center gap-1 ${
              metric.change > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {metric.change > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
            </div>
          </div>
          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${metric.change > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
              style={{ width: `${Math.min(Math.abs(metric.change), 100)}%` }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
