
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useState, useRef, KeyboardEvent } from "react";

interface RetentionChartProps {
  data: ProcessedAnalytics;
}

export function RetentionChart({ data }: RetentionChartProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const retentionData = [
    { day: "Day 1", actual: data.engagement.retention.day1.value, benchmark: data.engagement.retention.day1.benchmark },
    { day: "Day 7", actual: data.engagement.retention.day7.value, benchmark: data.engagement.retention.day7.benchmark },
  ];

  if (data.engagement.retention.day14) {
    retentionData.push({
      day: "Day 14",
      actual: data.engagement.retention.day14.value,
      benchmark: data.engagement.retention.day14.benchmark
    });
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === retentionData.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? retentionData.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(retentionData.length - 1);
        break;
      default:
        break;
    }
  };

  // Calculate difference for screen reader
  const getDifference = (actual: number, benchmark: number) => {
    const diff = actual - benchmark;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="retention-chart-title">User Retention vs Benchmark</h3>
      
      {/* Accessibility description */}
      <div className="sr-only" id="retention-chart-desc">
        This chart shows your app's user retention rates compared to industry benchmarks across different time periods. Use arrow keys to navigate between data points.
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? 
          `${retentionData[focusedIndex].day}: Actual retention ${retentionData[focusedIndex].actual}%, Benchmark ${retentionData[focusedIndex].benchmark}%, Difference ${getDifference(retentionData[focusedIndex].actual, retentionData[focusedIndex].benchmark)}` : 
          ''}
      </div>

      {/* Screen reader only table */}
      <div className="sr-only">
        <table aria-labelledby="retention-chart-title">
          <caption>User retention rates compared to benchmarks</caption>
          <thead>
            <tr>
              <th scope="col">Time Period</th>
              <th scope="col">Actual Retention</th>
              <th scope="col">Benchmark</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {retentionData.map((item, i) => (
              <tr key={i}>
                <td>{item.day}</td>
                <td>{item.actual}%</td>
                <td>{item.benchmark}%</td>
                <td>{getDifference(item.actual, item.benchmark)}</td>
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
        aria-labelledby="retention-chart-title"
        aria-describedby="retention-chart-desc"
        onKeyDown={handleKeyDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#9ca3af' }} 
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 10']}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, '']}
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#9b87f5" 
              strokeWidth={2}
              name="Actual"
              isAnimationActive={false} // Reduce motion for accessibility
              activeDot={{ 
                r: focusedIndex >= 0 ? 6 : 4,
                stroke: "white",
                strokeWidth: 2,
                fill: "#9b87f5"
              }}
              dot={{ 
                r: 4,
                stroke: "white",
                strokeWidth: 1,
                fill: "#9b87f5"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="#4C51BF" 
              strokeWidth={2}
              name="Benchmark"
              strokeDasharray="5 5"
              isAnimationActive={false} // Reduce motion for accessibility
              dot={{ 
                r: 4,
                stroke: "white",
                strokeWidth: 1,
                fill: "#4C51BF"
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Supplementary textual information */}
      <div className="mt-4 space-y-2">
        {retentionData.map((item, index) => (
          <div 
            key={index} 
            className={`p-2 rounded flex justify-between items-center ${focusedIndex === index ? 'bg-white/10' : ''}`}
            id={`retention-item-${index}`}
          >
            <span className="text-white">{item.day}</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full bg-[#9b87f5]" aria-hidden="true"></div>
                <span className="text-white">{item.actual}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full bg-[#4C51BF] border border-dashed border-[#4C51BF]" aria-hidden="true"></div>
                <span className="text-white">{item.benchmark}%</span>
              </div>
              <span className={`text-xs ${item.actual > item.benchmark ? 'text-green-400' : 'text-red-400'}`}>
                {getDifference(item.actual, item.benchmark)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
