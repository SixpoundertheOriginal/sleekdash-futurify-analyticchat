
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useState, useRef, KeyboardEvent } from "react";

interface ConversionFunnelProps {
  data: ProcessedAnalytics;
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const funnelData = [
    {
      stage: "Impressions",
      value: data.acquisition.impressions.value,
      color: "#9b87f5"
    },
    {
      stage: "Page Views",
      value: data.acquisition.pageViews.value,
      color: "#7F9CF5"
    },
    {
      stage: "Downloads",
      value: data.acquisition.downloads.value,
      color: "#4C51BF"
    }
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === funnelData.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? funnelData.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(funnelData.length - 1);
        break;
      default:
        break;
    }
  };

  // Calculate conversion rates
  const getConversionRate = (currentIndex: number, nextIndex: number) => {
    if (nextIndex >= funnelData.length) return null;
    const currentValue = funnelData[currentIndex].value;
    const nextValue = funnelData[nextIndex].value;
    return currentValue > 0 ? ((nextValue / currentValue) * 100).toFixed(1) + '%' : 'N/A';
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="conversion-funnel-title">Conversion Funnel</h3>
      
      {/* Accessibility description */}
      <div className="sr-only" id="conversion-funnel-desc">
        This chart shows your conversion funnel from impressions to downloads. Use arrow keys to navigate between stages.
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? 
          `${funnelData[focusedIndex].stage}: ${funnelData[focusedIndex].value.toLocaleString()} ${
            focusedIndex < funnelData.length - 1 ? 
              `Converting to ${funnelData[focusedIndex + 1].stage} at ${getConversionRate(focusedIndex, focusedIndex + 1)}` : 
              ''
          }` : 
          ''}
      </div>

      {/* Screen reader only table */}
      <div className="sr-only">
        <table aria-labelledby="conversion-funnel-title">
          <caption>Conversion funnel metrics</caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Value</th>
              <th scope="col">Conversion to Next Stage</th>
            </tr>
          </thead>
          <tbody>
            {funnelData.map((item, i) => (
              <tr key={i}>
                <td>{item.stage}</td>
                <td>{item.value.toLocaleString()}</td>
                <td>{getConversionRate(i, i + 1) || 'N/A'}</td>
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
        aria-labelledby="conversion-funnel-title"
        aria-describedby="conversion-funnel-desc"
        onKeyDown={handleKeyDown}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical">
            <XAxis 
              type="number" 
              tick={{ fill: '#9ca3af' }} 
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis 
              dataKey="stage" 
              type="category" 
              tick={{ fill: '#9ca3af' }} 
            />
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString(), "Count"]}
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#9b87f5" 
              radius={[0, 4, 4, 0]}
              isAnimationActive={false} // Reduce motion for accessibility
              label={{ 
                position: 'right',
                formatter: (value: number) => value.toLocaleString(),
                fill: 'white'
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Extra visual accessibility info */}
      <div className="mt-4 space-y-2">
        {funnelData.map((item, index) => (
          <div 
            key={index} 
            className={`p-2 rounded flex justify-between items-center ${focusedIndex === index ? 'bg-white/10' : ''}`}
            id={`funnel-item-${index}`}
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-white">{item.stage}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white font-medium">{item.value.toLocaleString()}</span>
              {index < funnelData.length - 1 && (
                <span className="text-white/60 text-xs">
                  {getConversionRate(index, index + 1)} to {funnelData[index + 1].stage}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
