
import { Card } from "@/components/ui/card";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { Download, DollarSign, Users, Activity, Target } from "lucide-react";
import { formatMetric } from "@/utils/analytics/formatting";
import { Skeleton } from "@/components/ui/skeleton";

interface GlobalMetricsProps {
  data: ProcessedAnalytics;
  isLoading?: boolean;
}

export function GlobalMetrics({ data, isLoading = false }: GlobalMetricsProps) {
  // Prepare the metrics data
  const metrics = [
    {
      title: "Downloads",
      value: data.acquisition.downloads.value,
      change: data.acquisition.downloads.change,
      icon: Download,
      format: "number"
    },
    {
      title: "Revenue",
      value: data.financial.proceeds.value,
      change: data.financial.proceeds.change,
      icon: DollarSign,
      format: "currency"
    },
    {
      title: "Conversion Rate",
      value: data.acquisition.conversionRate.value,
      change: data.acquisition.conversionRate.change,
      icon: Users,
      format: "percentage"
    },
    {
      title: "Sessions/Device",
      value: data.engagement.sessionsPerDevice.value,
      change: data.engagement.sessionsPerDevice.change,
      icon: Activity,
      format: "number"
    },
    {
      title: "Crashes",
      value: data.technical.crashes.value, 
      change: data.technical.crashes.change,
      inverseColor: true, // For crashes, negative change is good
      icon: Target,
      format: "number"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {isLoading 
        ? Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-white/5 border-white/10">
              <Skeleton className="h-4 w-20 mb-2 bg-white/10" />
              <Skeleton className="h-8 w-24 mb-3 bg-white/10" />
              <Skeleton className="h-4 w-16 bg-white/10" />
            </Card>
          ))
        : metrics.map((metric, i) => {
            const displayPositiveColor = metric.inverseColor 
              ? metric.change < 0 
              : metric.change > 0;
              
            return (
              <Card 
                key={i} 
                className="p-4 bg-white/5 hover:bg-white/10 transition-all border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-white/70">{metric.title}</span>
                    </div>
                    <span className="text-xl font-semibold text-white mt-1">
                      {formatMetric(metric.value, metric.format as any)}
                    </span>
                  </div>
                  <div 
                    className={`flex items-center px-2 py-1 rounded-full text-xs ${
                      displayPositiveColor 
                        ? 'text-emerald-400 bg-emerald-500/10' 
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </div>
                </div>
                
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${displayPositiveColor ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(Math.abs(metric.change), 100)}%` }}
                  />
                </div>
              </Card>
            );
          })
      }
    </div>
  );
}
