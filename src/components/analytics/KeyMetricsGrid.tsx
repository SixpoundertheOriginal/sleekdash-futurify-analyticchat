
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { formatMetric } from "@/utils/analytics/processAnalysis";

interface KeyMetricsGridProps {
  data: ProcessedAnalytics;
}

export function KeyMetricsGrid({ data }: KeyMetricsGridProps) {
  const metrics = [
    {
      title: "Total Downloads",
      value: data.acquisition.downloads.value,
      change: data.acquisition.downloads.change,
      format: "number"
    },
    {
      title: "Total Proceeds",
      value: data.financial.proceeds.value,
      change: data.financial.proceeds.change,
      format: "currency"
    },
    {
      title: "Conversion Rate",
      value: data.acquisition.conversionRate.value,
      change: data.acquisition.conversionRate.change,
      format: "percentage"
    },
    {
      title: "Crash Count",
      value: data.technical.crashes.value,
      change: data.technical.crashes.change,
      format: "number"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6 bg-white/5 border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60">{metric.title}</p>
              <h3 className="text-2xl font-semibold text-white mt-1">
                {formatMetric(metric.value, metric.format as any)}
              </h3>
            </div>
            <div className={`flex items-center gap-1 ${
              metric.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metric.change > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm">{Math.abs(metric.change)}%</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
