
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useState, useRef, KeyboardEvent } from "react";

interface EngagementMetricsProps {
  data: ProcessedAnalytics;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const engagementData = [
    {
      metric: "Sessions per Device",
      value: data.engagement.sessionsPerDevice.value,
      change: data.engagement.sessionsPerDevice.change,
      benchmark: null
    },
    {
      metric: "Day 1 Retention",
      value: data.engagement.retention.day1.value,
      change: null,
      benchmark: data.engagement.retention.day1.benchmark
    },
    {
      metric: "Day 7 Retention",
      value: data.engagement.retention.day7.value,
      change: null,
      benchmark: data.engagement.retention.day7.benchmark
    }
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === engagementData.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? engagementData.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(engagementData.length - 1);
        break;
      default:
        break;
    }
  };

  // Format data for screen reader
  const getFormattedMetricValue = (item: typeof engagementData[0]) => {
    if (item.metric.includes("Retention")) {
      return `${item.value}% (Benchmark: ${item.benchmark}%)`;
    } else {
      return `${item.value} (${item.change >= 0 ? '+' : ''}${item.change}% vs previous period)`;
    }
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="engagement-metrics-title">User Engagement Analysis</h3>
      
      {/* Accessibility description */}
      <div className="sr-only" id="engagement-metrics-desc">
        This chart shows user engagement metrics including sessions per device and retention rates. Use arrow keys to navigate between metrics.
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? 
          `${engagementData[focusedIndex].metric}: ${getFormattedMetricValue(engagementData[focusedIndex])}` : 
          ''}
      </div>

      {/* Screen reader only table */}
      <div className="sr-only">
        <table aria-labelledby="engagement-metrics-title">
          <caption>User engagement metrics</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Value</th>
              <th scope="col">{engagementData[0].change !== null ? 'Change' : 'Benchmark'}</th>
            </tr>
          </thead>
          <tbody>
            {engagementData.map((item, i) => (
              <tr key={i}>
                <td>{item.metric}</td>
                <td>{item.value}{item.metric.includes("Retention") ? '%' : ''}</td>
                <td>
                  {item.change !== null 
                    ? `${item.change >= 0 ? '+' : ''}${item.change}%` 
                    : `${item.benchmark}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div 
        className="h-[300px]"
        ref={chartRef}
        tabIndex={0}
        role="figure"
        aria-labelledby="engagement-metrics-title"
        aria-describedby="engagement-metrics-desc"
        onKeyDown={handleKeyDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="metric" 
              tick={{ fill: '#9ca3af' }} 
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              domain={[0, 'auto']}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value}${name === 'benchmark' ? '%' : name === 'value' && engagementData[0].metric.includes('Retention') ? '%' : ''}`, 
                name === 'value' ? 'Actual' : 'Benchmark'
              ]}
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Bar 
              dataKey="value" 
              name="Actual" 
              fill="#9b87f5"
              isAnimationActive={false} // Reduce motion for accessibility
              aria-label="Actual metrics values"
            />
            <Bar 
              dataKey="benchmark" 
              name="Benchmark" 
              fill="#4C51BF"
              isAnimationActive={false} // Reduce motion for accessibility
              aria-label="Benchmark values for comparison"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Supplementary textual information */}
      <div className="mt-4 space-y-2">
        {engagementData.map((item, index) => (
          <div 
            key={index} 
            className={`p-2 rounded flex justify-between items-center ${focusedIndex === index ? 'bg-white/10' : ''}`}
            id={`engagement-item-${index}`}
          >
            <span className="text-white">{item.metric}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full bg-[#9b87f5]" aria-hidden="true"></div>
                <span className="text-white">
                  {item.value}{item.metric.includes("Retention") ? '%' : ''}
                </span>
              </div>
              {item.benchmark !== null && (
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full bg-[#4C51BF]" aria-hidden="true"></div>
                  <span className="text-white">{item.benchmark}%</span>
                </div>
              )}
              {item.change !== null && (
                <span className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
