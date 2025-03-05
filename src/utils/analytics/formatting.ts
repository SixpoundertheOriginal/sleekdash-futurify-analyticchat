
import { formatValue } from "./metrics";

/**
 * Format metric for display based on type
 */
export const formatMetric = (value: number, type: 'percentage' | 'currency' | 'number' = 'number'): string => {
  if (type === 'percentage') {
    return `${value.toFixed(1)}%`;
  } else if (type === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  } else {
    return formatValue(value);
  }
};
