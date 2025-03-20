
import { MetricInput } from "../inputs/MetricInput";
import { formatPercentage } from "@/utils/analytics/formatters";

interface TechnicalMetricsTabProps {
  technicalMetrics: any;
  handleMetricChange: (category: string, metric: string, subMetric: string | null, value: string) => void;
}

export function TechnicalMetricsTab({
  technicalMetrics,
  handleMetricChange
}: TechnicalMetricsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricInput
          label="Crashes"
          value={technicalMetrics.crashes.value.toString()}
          onChange={(value) => handleMetricChange("technical", "crashes", "value", value)}
          changeValue={technicalMetrics.crashes.change}
          onChangeValueUpdate={(value) => handleMetricChange("technical", "crashes", "change", value)}
          formatter={(val) => Math.round(val).toString()}
        />
        <MetricInput
          label="Crash Rate (%)"
          value={technicalMetrics.crashRate.value.toString()}
          onChange={(value) => handleMetricChange("technical", "crashRate", "value", value)}
          formatter={formatPercentage}
        />
        <MetricInput
          label="Crash-Free Users (%)"
          value={technicalMetrics.crashFreeUsers.value.toString()}
          onChange={(value) => handleMetricChange("technical", "crashFreeUsers", "value", value)}
          changeValue={technicalMetrics.crashFreeUsers.change}
          onChangeValueUpdate={(value) => handleMetricChange("technical", "crashFreeUsers", "change", value)}
          formatter={formatPercentage}
        />
      </div>
    </div>
  );
}
