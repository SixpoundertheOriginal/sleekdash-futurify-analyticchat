
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
  // Ensure we have valid data with fallbacks to prevent 0 values
  const safeData = {
    acquisition: {
      downloads: { 
        value: data.acquisition.downloads.value || 0, 
        change: data.acquisition.downloads.change || 0 
      },
      conversionRate: { 
        value: data.acquisition.conversionRate.value || 0, 
        change: data.acquisition.conversionRate.change || 0 
      }
    },
    financial: {
      proceeds: { 
        value: data.financial.proceeds.value || 0, 
        change: data.financial.proceeds.change || 0 
      }
    },
    engagement: {
      sessionsPerDevice: { 
        value: data.engagement.sessionsPerDevice.value || 0, 
        change: data.engagement.sessionsPerDevice.change || 0 
      }
    },
    technical: {
      crashes: { 
        value: data.technical.crashes.value || 0, 
        change: data.technical.crashes.change || 0 
      }
    }
  };

  // Check if all values are zero, which might indicate data wasn't loaded properly
  const hasNoData = 
    safeData.acquisition.downloads.value === 0 &&
    safeData.financial.proceeds.value === 0 &&
    safeData.acquisition.conversionRate.value === 0 &&
    safeData.engagement.sessionsPerDevice.value === 0;

  // Prepare the metrics data
  const metrics = [
    {
      title: "Downloads",
      value: safeData.acquisition.downloads.value,
      change: safeData.acquisition.downloads.change,
      icon: Download,
      format: "number"
    },
    {
      title: "Revenue",
      value: safeData.financial.proceeds.value,
      change: safeData.financial.proceeds.change,
      icon: DollarSign,
      format: "currency"
    },
    {
      title: "Conversion Rate",
      value: safeData.acquisition.conversionRate.value,
      change: safeData.acquisition.conversionRate.change,
      icon: Users,
      format: "percentage"
    },
    {
      title: "Sessions/Device",
      value: safeData.engagement.sessionsPerDevice.value,
      change: safeData.engagement.sessionsPerDevice.change,
      icon: Activity,
      format: "number"
    },
    {
      title: "Crashes",
      value: safeData.technical.crashes.value, 
      change: safeData.technical.crashes.change,
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
      
      {hasNoData && !isLoading && (
        <div className="col-span-5 text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-white">No data available. Please analyze some app store data to view metrics.</p>
        </div>
      )}
    </div>
  );
}
