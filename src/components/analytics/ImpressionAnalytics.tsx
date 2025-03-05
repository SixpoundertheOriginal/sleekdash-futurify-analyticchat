
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { formatMetric } from "@/utils/analytics/formatting";
import { Eye, MousePointer } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

interface ImpressionAnalyticsProps {
  data: ProcessedAnalytics;
}

export function ImpressionAnalytics({ data }: ImpressionAnalyticsProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Generate historical data for visualization
  const generateImpressionData = () => {
    const periods = 12;
    const baseValue = data.acquisition.impressions.value;
    const monthlyChange = data.acquisition.impressions.change / periods;
    
    return Array.from({ length: periods }, (_, i) => {
      const value = baseValue * (1 - ((periods - i - 1) * (monthlyChange / 100)));
      return {
        month: `Month ${i + 1}`,
        impressions: Math.round(value),
        views: Math.round(value * (data.acquisition.funnelMetrics.impressionsToViews / 100))
      };
    });
  };

  const impressionData = generateImpressionData();

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === impressionData.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? impressionData.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(impressionData.length - 1);
        break;
      default:
        break;
    }
  };

  // Format impression info for screen reader
  const getImpressionInfo = (index: number) => {
    const item = impressionData[index];
    return `${item.month}: ${formatMetric(item.impressions, 'number')} impressions, ${formatMetric(item.views, 'number')} page views`;
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="impression-analytics-title">Impression & View Analysis</h3>
      
      {/* Accessibility description */}
      <div className="sr-only" id="impression-analytics-desc">
        This chart shows the trend of impressions and page views over time. Use arrow keys to navigate between time periods.
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? getImpressionInfo(focusedIndex) : ''}
      </div>

      {/* Screen reader only table */}
      <div className="sr-only">
        <table aria-labelledby="impression-analytics-title">
          <caption>Impressions and page views over time</caption>
          <thead>
            <tr>
              <th scope="col">Time Period</th>
              <th scope="col">Impressions</th>
              <th scope="col">Page Views</th>
              <th scope="col">View Rate</th>
            </tr>
          </thead>
          <tbody>
            {impressionData.map((item, i) => (
              <tr key={i}>
                <td>{item.month}</td>
                <td>{formatMetric(item.impressions, 'number')}</td>
                <td>{formatMetric(item.views, 'number')}</td>
                <td>{((item.views / item.impressions) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm text-white/60">Impressions:</span>
            <span className="text-sm font-semibold text-white">
              {formatMetric(data.acquisition.impressions.value, "number")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/60">Page Views:</span>
            <span className="text-sm font-semibold text-white">
              {formatMetric(data.acquisition.pageViews.value, "number")}
            </span>
          </div>
        </div>
        <div className="text-xs text-white/40">
          <span className="text-primary">+{data.acquisition.impressions.change}%</span> vs. previous period
        </div>
      </div>
      
      <div 
        className="h-[250px]"
        ref={chartRef}
        tabIndex={0}
        role="figure"
        aria-labelledby="impression-analytics-title"
        aria-describedby="impression-analytics-desc"
        onKeyDown={handleKeyDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={impressionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#9ca3af' }} 
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              tickFormatter={(value) => formatMetric(value, 'number')}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
              formatter={(value: number) => [formatMetric(value, 'number'), 'Count']}
            />
            <Area 
              type="monotone" 
              dataKey="impressions" 
              stackId="1"
              stroke="#9b87f5" 
              fill="#9b87f5" 
              fillOpacity={0.3}
              name="Impressions"
              isAnimationActive={false} // Reduce motion for accessibility
              activeDot={{ 
                r: focusedIndex >= 0 ? 6 : 4,
                stroke: "white",
                strokeWidth: 2,
                fill: "#9b87f5"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="views" 
              stackId="1"
              stroke="#4C51BF" 
              fill="#4C51BF" 
              fillOpacity={0.3}
              name="Views"
              isAnimationActive={false} // Reduce motion for accessibility
              activeDot={{ 
                r: focusedIndex >= 0 ? 6 : 4,
                stroke: "white",
                strokeWidth: 2,
                fill: "#4C51BF"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary and context information */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60">Impressions to Views Rate</p>
          <p className="text-lg font-semibold text-white">
            {data.acquisition.funnelMetrics.impressionsToViews.toFixed(1)}%
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60">Views to Downloads Rate</p>
          <p className="text-lg font-semibold text-white">
            {data.acquisition.funnelMetrics.viewsToDownloads.toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  );
}
