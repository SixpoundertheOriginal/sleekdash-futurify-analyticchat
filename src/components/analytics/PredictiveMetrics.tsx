
import { Card } from "@/components/ui/card";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { formatMetric } from "@/utils/analytics/processAnalysis";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PredictiveMetricsProps {
  data: ProcessedAnalytics;
}

export function PredictiveMetrics({ data }: PredictiveMetricsProps) {
  const calculatePrediction = (current: number, change: number) => {
    return current * (1 + (change / 100));
  };

  // Enhanced predictions with realistic values
  const predictions = [
    {
      title: "Projected Downloads",
      current: data.acquisition.downloads.value,
      predicted: calculatePrediction(data.acquisition.downloads.value, data.acquisition.downloads.change),
      change: data.acquisition.downloads.change,
      format: "number"
    },
    {
      title: "Projected Revenue",
      current: data.financial.proceeds.value,
      predicted: calculatePrediction(data.financial.proceeds.value, data.financial.proceeds.change),
      change: data.financial.proceeds.change,
      format: "currency"
    },
    {
      title: "Estimated Conversion Rate",
      current: data.acquisition.conversionRate.value,
      predicted: calculatePrediction(data.acquisition.conversionRate.value, data.acquisition.conversionRate.change),
      change: data.acquisition.conversionRate.change,
      format: "percentage"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {predictions.map((metric, index) => (
        <Card key={index} className="p-6 bg-white/5 border-white/10">
          <h3 className="text-sm text-white/60">{metric.title}</h3>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Current</span>
              <span className="text-white">
                {formatMetric(metric.current, metric.format as any)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Predicted</span>
              <div className="flex items-center gap-2">
                <span className="text-white">
                  {formatMetric(metric.predicted, metric.format as any)}
                </span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400"
                style={{ width: `${Math.min(Math.abs(metric.change), 100)}%` }}
              />
            </div>
            <div className="text-xs text-right text-emerald-400">
              +{metric.change.toFixed(1)}% projected growth
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
