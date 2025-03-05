
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useState, useEffect, memo } from "react";
import { MetricCard } from "./MetricCard";
import { NoDataCard } from "./NoDataCard";
import { MetricsLoadingSkeleton } from "./MetricsLoadingSkeleton";
import { prepareGlobalMetrics, countValidMetrics } from "@/utils/analytics/metricPreparation";
import { ContextualHelp } from "@/components/ui/contextual-help";

interface GlobalMetricsProps {
  data: ProcessedAnalytics;
  isLoading?: boolean;
}

function GlobalMetricsBase({ data, isLoading = false }: GlobalMetricsProps) {
  const [dataReady, setDataReady] = useState(false);

  // Verify we have valid data after component mount
  useEffect(() => {
    console.log("GlobalMetrics received data:", data);
    
    // Add a slight delay to ensure the component renders properly
    const timer = setTimeout(() => {
      setDataReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [data]);

  if (isLoading) {
    return <MetricsLoadingSkeleton />;
  }

  // Prepare metrics data
  const metrics = prepareGlobalMetrics(data);
  const validMetricsCount = countValidMetrics(metrics);
  
  console.log("Valid metrics count:", validMetricsCount);

  // Check if all values are zero, which might indicate data wasn't loaded properly
  const hasNoData = validMetricsCount === 0;
  console.log("Has no data:", hasNoData, "Is loading:", isLoading);

  if (hasNoData && dataReady) {
    return <NoDataCard />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Key Performance Metrics</h3>
        <ContextualHelp
          content={
            <div>
              <p className="font-medium">About Global Metrics</p>
              <p className="mt-1 text-xs">These cards show key performance indicators (KPIs) with period-over-period changes.</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                <li><span className="font-medium">Green arrows</span>: Positive trends</li>
                <li><span className="font-medium">Red arrows</span>: Negative trends (except for metrics where decreases are good)</li>
                <li><span className="font-medium">Gray values</span>: Insufficient data or no change</li>
              </ul>
              <p className="mt-1 text-xs">Click any metric to see detailed trend analysis.</p>
            </div>
          }
        />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric, i) => (
          <MetricCard 
            key={i}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            format={metric.format}
            inverseColor={metric.inverseColor}
          />
        ))}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const GlobalMetrics = memo(GlobalMetricsBase);
