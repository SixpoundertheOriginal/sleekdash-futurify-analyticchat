import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics, formatMetric } from "@/utils/analytics/processAnalysis";
import { useState, useRef, KeyboardEvent } from "react";

interface TrendAnalysisProps {
  data: ProcessedAnalytics;
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const generateHistoricalData = (value: number, change: number) => {
    const points = 12;
    const data = [];
    let currentValue = value;
    
    for (let i = points - 1; i >= 0; i--) {
      const periodChange = (change / points) * (1 + Math.random() * 0.5);
      currentValue = currentValue / (1 + (change / 100));
      data.unshift({
        period: `Period ${points - i}`,
        value: Math.round(currentValue),
        predicted: i === points - 1 ? value * (1 + (change / 100)) : null
      });
    }
    return data;
  };

  const downloadsTrend = generateHistoricalData(
    data.acquisition.downloads.value,
    data.acquisition.downloads.change
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === downloadsTrend.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? downloadsTrend.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(downloadsTrend.length - 1);
        break;
      default:
        break;
    }
  };

  const getTrendInfo = (index: number) => {
    const item = downloadsTrend[index];
    let info = `${item.period}: ${formatMetric(item.value, 'number')} downloads`;
    
    if (index > 0) {
      const prevValue = downloadsTrend[index - 1].value;
      const change = ((item.value - prevValue) / prevValue) * 100;
      info += `, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% from previous period`;
    }
    
    if (item.predicted) {
      info += `, predicted next value: ${formatMetric(item.predicted, 'number')} downloads`;
    }
    
    return info;
  };

  return (
    <Card className="p-8 bg-white/5 border-white/10 shadow-sm backdrop-blur-sm">
      <h3 className="font-display font-semibold text-white mb-6" id="trend-analysis-title">
        Downloads Trend Analysis
      </h3>
      
      <div className="sr-only" id="trend-analysis-desc">
        This chart shows the trend of downloads over time with a prediction for future downloads. Use arrow keys to navigate between time periods.
      </div>

      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? getTrendInfo(focusedIndex) : ''}
      </div>

      <div className="sr-only">
        <table aria-labelledby="trend-analysis-title">
          <caption>Downloads trend over time</caption>
          <thead>
            <tr>
              <th scope="col">Time Period</th>
              <th scope="col">Downloads</th>
              <th scope="col">Change from Previous</th>
              <th scope="col">Predicted (Future)</th>
            </tr>
          </thead>
          <tbody>
            {downloadsTrend.map((item, i) => (
              <tr key={i}>
                <td>{item.period}</td>
                <td>{formatMetric(item.value, 'number')}</td>
                <td>
                  {i > 0 ? 
                    `${(((item.value - downloadsTrend[i-1].value) / downloadsTrend[i-1].value) * 100).toFixed(1)}%` : 
                    'N/A'}
                </td>
                <td>{item.predicted ? formatMetric(item.predicted, 'number') : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div 
        className="h-[320px] p-4 bg-black/10 rounded-lg border border-white/5 backdrop-blur-sm my-4"
        ref={chartRef}
        tabIndex={0}
        role="figure"
        aria-labelledby="trend-analysis-title"
        aria-describedby="trend-analysis-desc"
        onKeyDown={handleKeyDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={downloadsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="period" 
              tick={{ fill: '#9ca3af' }} 
            />
            <YAxis 
              tick={{ fill: '#9ca3af' }} 
              tickFormatter={(value) => formatMetric(value, 'number')}
            />
            <Tooltip
              formatter={(value: number) => [formatMetric(value, 'number'), 'Downloads']}
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
                color: 'white',
                padding: '8px 16px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
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
              dataKey="predicted" 
              stroke="#4C51BF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted"
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

      <div className="mt-6 flex flex-wrap gap-8 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-3 rounded-full bg-[#9b87f5]" aria-hidden="true"></div>
          <span className="text-white">Actual Downloads</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-3 rounded-full bg-[#4C51BF] border border-dashed border-[#4C51BF]" aria-hidden="true"></div>
          <span className="text-white">Predicted Downloads</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
        <p className="text-white text-sm">
          Overall trend: <span className={data.acquisition.downloads.change >= 0 ? 'text-green-400' : 'text-red-400'}>
            {data.acquisition.downloads.change >= 0 ? 'Growing ' : 'Declining '}
            {Math.abs(data.acquisition.downloads.change)}%
          </span> over the analyzed period.
        </p>
      </div>
    </Card>
  );
}
