
import { MetricCategory } from './types';

/**
 * Create a standardized set of chart options that can be used across different visualizations
 */
export function getStandardChartOptions(category: MetricCategory) {
  const baseOptions = {
    colors: ["#8884d8", "#4ade80", "#f87171", "#fb923c"],
    grid: {
      stroke: "rgba(255,255,255,0.1)",
      strokeDasharray: "3 3"
    },
    tooltip: {
      contentStyle: {
        backgroundColor: "#1e1b4b", 
        borderColor: "#4f46e5",
        color: "#ffffff"
      }
    },
    text: {
      fill: "#9ca3af"
    }
  };
  
  // Customize based on metric category if needed
  switch (category) {
    case MetricCategory.ACQUISITION:
      return {
        ...baseOptions,
        colors: ["#4ade80", "#8884d8", "#fb923c"]
      };
    case MetricCategory.FINANCIAL:
      return {
        ...baseOptions,
        colors: ["#60a5fa", "#4ade80", "#f87171"]
      };
    default:
      return baseOptions;
  }
}
