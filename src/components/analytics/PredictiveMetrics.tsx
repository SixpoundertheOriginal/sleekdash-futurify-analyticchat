
import { Card } from "@/components/ui/card";
import { ProcessedAnalytics, formatMetric } from "@/utils/analytics/processAnalysis";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { generatePredictions, calculateProjectedValue } from "@/utils/analytics/predictions";

interface PredictiveMetricsProps {
  data: ProcessedAnalytics;
  isLoading?: boolean;
}

export function PredictiveMetrics({ data, isLoading = false }: PredictiveMetricsProps) {
  // Generate predictions based on actual data
  const predictions = generatePredictions(data);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((_, index) => (
          <Card key={index} className="p-6 bg-white/5 border-white/10 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
              <div className="mt-3 h-1 bg-white/10 rounded-full" />
              <div className="h-3 bg-white/10 rounded w-1/4 ml-auto" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card className="p-6 bg-white/5 border-white/10 text-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <p className="text-white/80">Not enough data to generate predictions</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {predictions.map((metric, index) => {
        const predicted = calculateProjectedValue(metric.currentValue, metric.changeRate);
        return (
          <Card key={index} className="p-6 bg-white/5 border-white/10">
            <h3 className="text-sm text-white/60">{metric.title}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Current</span>
                <span className="text-white">
                  {formatMetric(metric.currentValue, metric.format)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Predicted</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">
                    {formatMetric(predicted, metric.format)}
                  </span>
                  {metric.changeRate > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${metric.changeRate > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.min(Math.abs(metric.changeRate), 100)}%` }}
                />
              </div>
              <div className={`text-xs text-right ${metric.changeRate > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metric.changeRate > 0 ? '+' : ''}{metric.changeRate.toFixed(1)}% projected growth
                {metric.confidenceLevel && (
                  <span className="text-white/40 ml-1">
                    ({Math.round(metric.confidenceLevel * 100)}% confidence)
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
