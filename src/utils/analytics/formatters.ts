
// Default formatters
export const formatValue = (value: number, prefix = '') => {
  if (value >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}K`;
  } else {
    return `${prefix}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
  }
};

export const formatCurrency = (value: number) => formatValue(value, '$');
export const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
