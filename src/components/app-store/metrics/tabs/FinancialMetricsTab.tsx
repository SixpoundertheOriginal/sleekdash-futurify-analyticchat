
import { MetricInput } from "../inputs/MetricInput";
import { formatCurrency } from "@/utils/analytics/formatters";

interface FinancialMetricsTabProps {
  financialMetrics: any;
  handleMetricChange: (category: string, metric: string, subMetric: string | null, value: string) => void;
}

export function FinancialMetricsTab({
  financialMetrics,
  handleMetricChange
}: FinancialMetricsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricInput
          label="Total Proceeds"
          value={financialMetrics.proceeds.value.toString()}
          onChange={(value) => handleMetricChange("financial", "proceeds", "value", value)}
          changeValue={financialMetrics.proceeds.change}
          onChangeValueUpdate={(value) => handleMetricChange("financial", "proceeds", "change", value)}
          formatter={formatCurrency}
        />
        <MetricInput
          label="Proceeds Per User"
          value={financialMetrics.proceedsPerUser.value.toString()}
          onChange={(value) => handleMetricChange("financial", "proceedsPerUser", "value", value)}
          changeValue={financialMetrics.proceedsPerUser.change}
          onChangeValueUpdate={(value) => handleMetricChange("financial", "proceedsPerUser", "change", value)}
          formatter={formatCurrency}
        />
      </div>
    </div>
  );
}
