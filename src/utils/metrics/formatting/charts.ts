
import { MetricCategory } from './types';
import { getCategoryColorScheme } from './colors';

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

/**
 * Get a standardized set of chart axis configurations
 * @param category The metric category influencing the styling
 * @param includeAxis Whether to include axis lines
 * @returns Configuration object for chart axes
 */
export function getStandardAxisConfig(category: MetricCategory, includeAxis = true) {
  return {
    xAxis: {
      tickLine: includeAxis,
      axisLine: includeAxis,
      stroke: "#4b5563",
      fontSize: 12,
      tickMargin: 10
    },
    yAxis: {
      tickLine: includeAxis,
      axisLine: includeAxis,
      stroke: "#4b5563",
      fontSize: 12,
      tickMargin: 10
    },
    cartesianGrid: {
      stroke: "#1f2937",
      strokeDasharray: "3 3"
    }
  };
}

/**
 * Generate standard tooltip formatter for charts based on metric type
 * @param category The metric category
 * @returns Tooltip formatter function
 */
export function getTooltipFormatter(category: MetricCategory) {
  return (value: number) => {
    switch (category) {
      case MetricCategory.FINANCIAL:
        return `$${value.toLocaleString()}`;
      case MetricCategory.PERFORMANCE:
      case MetricCategory.OPPORTUNITY:
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };
}

/**
 * Get a consistent chart configuration for a specific visualization type
 * @param category The metric category
 * @param chartType The type of chart (bar, line, area, etc.)
 * @returns Standard chart configuration
 */
export function getChartConfig(category: MetricCategory, chartType: 'bar' | 'line' | 'area' | 'pie') {
  const colors = getCategoryColorScheme(category);
  
  const baseConfig = {
    colors,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    ...getStandardAxisConfig(category)
  };
  
  switch (chartType) {
    case 'bar':
      return {
        ...baseConfig,
        barSize: 20,
        barGap: 4
      };
    case 'line':
      return {
        ...baseConfig,
        dot: { r: 4, strokeWidth: 2 },
        activeDot: { r: 6, strokeWidth: 0 }
      };
    case 'area':
      return {
        ...baseConfig,
        fillOpacity: 0.6,
        strokeWidth: 2
      };
    case 'pie':
      return {
        colors,
        innerRadius: '30%',
        outerRadius: '70%',
        paddingAngle: 2,
        labelLine: { stroke: '#9ca3af' },
        label: { fill: '#e5e7eb', fontSize: 12 }
      };
    default:
      return baseConfig;
  }
}
