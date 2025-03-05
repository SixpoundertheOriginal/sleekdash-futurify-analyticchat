
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics, formatMetric } from "@/utils/analytics/processAnalysis";
import { useState, useRef, KeyboardEvent } from "react";

interface ProceedsAnalysisProps {
  data: ProcessedAnalytics;
}

export function ProceedsAnalysis({ data }: ProceedsAnalysisProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const generateRevenueData = () => {
    const periods = 12;
    const baseRevenue = data.financial.proceeds.value;
    const basePerUser = data.financial.proceedsPerUser.value;
    const monthlyChange = data.financial.proceeds.change / periods;
    
    return Array.from({ length: periods }, (_, i) => {
      const value = baseRevenue * (1 - ((periods - i - 1) * (monthlyChange / 100)));
      return {
        month: `Month ${i + 1}`,
        revenue: Math.round(value),
        revenuePerUser: basePerUser * (1 - ((periods - i - 1) * (monthlyChange / 100)))
      };
    });
  };

  const revenueData = generateRevenueData();

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === revenueData.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? revenueData.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(revenueData.length - 1);
        break;
      default:
        break;
    }
  };

  // Format revenue info for screen reader
  const getRevenueInfo = (index: number) => {
    const item = revenueData[index];
    return `${item.month}: Total revenue ${formatMetric(item.revenue, 'currency')}, Revenue per user $${item.revenuePerUser.toFixed(2)}`;
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="proceeds-analysis-title">Revenue Analysis</h3>
      
      {/* Accessibility description */}
      <div className="sr-only" id="proceeds-analysis-desc">
        This chart shows revenue trends over time, both total revenue and revenue per user. Use arrow keys to navigate between time periods.
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? getRevenueInfo(focusedIndex) : ''}
      </div>

      {/* Screen reader only table */}
      <div className="sr-only">
        <table aria-labelledby="proceeds-analysis-title">
          <caption>Revenue analysis over time</caption>
          <thead>
            <tr>
              <th scope="col">Time Period</th>
              <th scope="col">Total Revenue</th>
              <th scope="col">Revenue Per User</th>
            </tr>
          </thead>
          <tbody>
            {revenueData.map((item, i) => (
              <tr key={i}>
                <td>{item.month}</td>
                <td>{formatMetric(item.revenue, 'currency')}</td>
                <td>${item.revenuePerUser.toFixed(2)}</td>
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
        aria-labelledby="proceeds-analysis-title"
        aria-describedby="proceeds-analysis-desc"
        onKeyDown={handleKeyDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#9ca3af' }} 
            />
            <YAxis 
              yAxisId="left" 
              tick={{ fill: '#9ca3af' }} 
              tickFormatter={(value) => `$${formatMetric(value)}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#9ca3af' }} 
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
              formatter={(value: number, name: string) => [
                name === 'revenue' ? `$${formatMetric(value)}` : `$${value.toFixed(2)}`,
                name === 'revenue' ? 'Total Revenue' : 'Revenue per User'
              ]}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#9b87f5" 
              strokeWidth={2}
              name="revenue"
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
              yAxisId="right"
              type="monotone" 
              dataKey="revenuePerUser" 
              stroke="#4C51BF" 
              strokeWidth={2}
              name="revenuePerUser"
              isAnimationActive={false} // Reduce motion for accessibility
              activeDot={{ 
                r: focusedIndex >= 0 ? 6 : 4,
                stroke: "white",
                strokeWidth: 2,
                fill: "#4C51BF"
              }}
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

      {/* Legend and derived metrics */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 rounded-full bg-[#9b87f5]" aria-hidden="true"></div>
          <span className="text-white">Total Revenue</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 rounded-full bg-[#4C51BF]" aria-hidden="true"></div>
          <span className="text-white">Revenue per User</span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60">Average Revenue per Download</p>
          <p className="text-lg font-semibold text-white">
            ${data.financial.derivedMetrics.arpd.toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60">Monetization Efficiency</p>
          <p className="text-lg font-semibold text-white">
            {data.financial.derivedMetrics.monetizationEfficiency.toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  );
}
