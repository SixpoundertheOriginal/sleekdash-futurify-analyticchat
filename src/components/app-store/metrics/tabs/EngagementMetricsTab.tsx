
import { MetricInput } from "../inputs/MetricInput";
import { formatValue, formatPercentage } from "@/utils/analytics/formatters";

interface EngagementMetricsTabProps {
  engagementMetrics: any;
  handleMetricChange: (category: string, metric: string, subMetric: string | null, value: string) => void;
}

export function EngagementMetricsTab({
  engagementMetrics,
  handleMetricChange
}: EngagementMetricsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricInput
          label="Sessions Per Device"
          value={engagementMetrics.sessionsPerDevice.value.toString()}
          onChange={(value) => handleMetricChange("engagement", "sessionsPerDevice", "value", value)}
          changeValue={engagementMetrics.sessionsPerDevice.change}
          onChangeValueUpdate={(value) => handleMetricChange("engagement", "sessionsPerDevice", "change", value)}
          formatter={formatValue}
        />
        <MetricInput
          label="Day 1 Retention (%)"
          value={engagementMetrics.retention.day1.value.toString()}
          onChange={(value) => handleMetricChange("engagement", "retention", "day1", value)}
          benchmark={engagementMetrics.retention.day1.benchmark}
          formatter={formatPercentage}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricInput
          label="Day 7 Retention (%)"
          value={engagementMetrics.retention.day7.value.toString()}
          onChange={(value) => handleMetricChange("engagement", "retention", "day7", value)}
          benchmark={engagementMetrics.retention.day7.benchmark}
          formatter={formatPercentage}
        />
        {engagementMetrics.retention.day14 && (
          <MetricInput
            label="Day 14 Retention (%)"
            value={engagementMetrics.retention.day14.value.toString()}
            onChange={(value) => handleMetricChange("engagement", "retention", "day14", value)}
            benchmark={engagementMetrics.retention.day14.benchmark}
            formatter={formatPercentage}
          />
        )}
      </div>
      {engagementMetrics.retention.day28 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricInput
            label="Day 28 Retention (%)"
            value={engagementMetrics.retention.day28.value.toString()}
            onChange={(value) => handleMetricChange("engagement", "retention", "day28", value)}
            benchmark={engagementMetrics.retention.day28.benchmark}
            formatter={formatPercentage}
          />
        </div>
      )}
    </div>
  );
}
