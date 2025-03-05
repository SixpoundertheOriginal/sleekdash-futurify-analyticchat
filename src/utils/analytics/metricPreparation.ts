
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { Download, DollarSign, Users, Activity, Target } from "lucide-react";

export interface PreparedMetric {
  title: string;
  value: number;
  change: number;
  icon: typeof Download;
  format: "number" | "currency" | "percentage";
  inverseColor?: boolean;
}

export function prepareGlobalMetrics(data: ProcessedAnalytics): PreparedMetric[] {
  // Ensure we have valid data with fallbacks to prevent 0 values
  const safeData = {
    acquisition: {
      downloads: { 
        value: data?.acquisition?.downloads?.value || 0, 
        change: data?.acquisition?.downloads?.change || 0 
      },
      conversionRate: { 
        value: data?.acquisition?.conversionRate?.value || 0, 
        change: data?.acquisition?.conversionRate?.change || 0 
      }
    },
    financial: {
      proceeds: { 
        value: data?.financial?.proceeds?.value || 0, 
        change: data?.financial?.proceeds?.change || 0 
      }
    },
    engagement: {
      sessionsPerDevice: { 
        value: data?.engagement?.sessionsPerDevice?.value || 0, 
        change: data?.engagement?.sessionsPerDevice?.change || 0 
      }
    },
    technical: {
      crashes: { 
        value: data?.technical?.crashes?.value || 0, 
        change: data?.technical?.crashes?.change || 0 
      }
    }
  };

  // Prepare the metrics data
  return [
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
}

export function countValidMetrics(metrics: PreparedMetric[]): number {
  return metrics.filter(metric => metric.value > 0).length;
}
