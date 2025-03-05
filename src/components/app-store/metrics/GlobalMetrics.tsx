
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { NoDataCard } from "./NoDataCard";
import { MetricsLoadingSkeleton } from "./MetricsLoadingSkeleton";
import { prepareGlobalMetrics, countValidMetrics } from "@/utils/analytics/metricPreparation";

interface GlobalMetricsProps {
  data: ProcessedAnalytics;
  isLoading?: boolean;
}

export function GlobalMetrics({ data, isLoading = false }: GlobalMetricsProps) {
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
  );
}
