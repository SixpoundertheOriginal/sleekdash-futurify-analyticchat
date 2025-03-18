
import { MetricInput } from "../inputs/MetricInput";
import { formatValue, formatPercentage } from "@/utils/analytics/formatters";

interface AcquisitionMetricsTabProps {
  acquisitionMetrics: any;
  handleMetricChange: (category: string, metric: string, subMetric: string | null, value: string) => void;
}

export function AcquisitionMetricsTab({ 
  acquisitionMetrics, 
  handleMetricChange 
}: AcquisitionMetricsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricInput
          label="Downloads"
          value={acquisitionMetrics.downloads.value.toString()}
          onChange={(value) => handleMetricChange("acquisition", "downloads", "value", value)}
          changeValue={acquisitionMetrics.downloads.change}
          onChangeValueUpdate={(value) => handleMetricChange("acquisition", "downloads", "change", value)}
          formatter={formatValue}
        />
        <MetricInput
          label="Impressions"
          value={acquisitionMetrics.impressions.value.toString()}
          onChange={(value) => handleMetricChange("acquisition", "impressions", "value", value)}
          changeValue={acquisitionMetrics.impressions.change}
          onChangeValueUpdate={(value) => handleMetricChange("acquisition", "impressions", "change", value)}
          formatter={formatValue}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricInput
          label="Page Views"
          value={acquisitionMetrics.pageViews.value.toString()}
          onChange={(value) => handleMetricChange("acquisition", "pageViews", "value", value)}
          changeValue={acquisitionMetrics.pageViews.change}
          onChangeValueUpdate={(value) => handleMetricChange("acquisition", "pageViews", "change", value)}
          formatter={formatValue}
        />
        <MetricInput
          label="Conversion Rate (%)"
          value={acquisitionMetrics.conversionRate.value.toString()}
          onChange={(value) => handleMetricChange("acquisition", "conversionRate", "value", value)}
          changeValue={acquisitionMetrics.conversionRate.change}
          onChangeValueUpdate={(value) => handleMetricChange("acquisition", "conversionRate", "change", value)}
          formatter={formatPercentage}
        />
      </div>
    </div>
  );
}
