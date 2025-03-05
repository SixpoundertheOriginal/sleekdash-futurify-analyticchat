
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useState, useRef, KeyboardEvent } from "react";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";

interface ComparativeAnalysisProps {
  data: ProcessedAnalytics;
  isLoading?: boolean;
}

export function ComparativeAnalysis({ data, isLoading = false }: ComparativeAnalysisProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const comparativeData = [
    {
      metric: "Downloads Growth",
      current: data.acquisition.downloads.change,
      industry: 15 // Example industry average
    },
    {
      metric: "Revenue Growth",
      current: data.financial.proceeds.change,
      industry: 20 // Example industry average
    },
    {
      metric: "Conversion Rate",
      current: data.acquisition.conversionRate.value,
      industry: 3.2 // Example industry average
    }
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev === comparativeData.length - 1 ? 0 : prev + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? comparativeData.length - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(comparativeData.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="comparative-analysis-title">Industry Comparison</h3>
      
      {/* Accessibility description */}
      <div className="sr-only" id="comparative-analysis-desc">
        This chart compares your app's performance metrics against industry averages. Use arrow keys to navigate between metrics.
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {focusedIndex >= 0 ? 
          `${comparativeData[focusedIndex].metric}: Your app: ${comparativeData[focusedIndex].current}${
            comparativeData[focusedIndex].metric.includes('Rate') ? '%' : '%'
          }, Industry average: ${comparativeData[focusedIndex].industry}${
            comparativeData[focusedIndex].metric.includes('Rate') ? '%' : '%'
          }` : 
          ''}
      </div>

      {/* Screen reader only table */}
      <div className="sr-only">
        <table aria-labelledby="comparative-analysis-title">
          <caption>Comparison of your app metrics against industry averages</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Your App</th>
              <th scope="col">Industry Average</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {comparativeData.map((item, i) => (
              <tr key={i}>
                <td>{item.metric}</td>
                <td>{item.current}%</td>
                <td>{item.industry}%</td>
                <td>{(item.current - item.industry).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SkeletonWrapper 
        isLoading={isLoading} 
        className="h-[300px]"
        items={[
          { height: "100%", width: "100%", className: "rounded-md" }
        ]}
      >
        <div 
          className="h-[300px]"
          ref={chartRef}
          tabIndex={0}
          role="figure"
          aria-labelledby="comparative-analysis-title"
          aria-describedby="comparative-analysis-desc"
          onKeyDown={handleKeyDown}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparativeData}>
              <XAxis 
                dataKey="metric" 
                tick={{ fill: '#9ca3af' }} 
              />
              <YAxis 
                tick={{ fill: '#9ca3af' }} 
                tickFormatter={(value) => `${value}%`}
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
              <Legend
                formatter={(value) => <span style={{ color: 'white', opacity: 0.8 }}>{value}</span>}
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Bar 
                dataKey="current" 
                name="Your App" 
                fill="#9b87f5"
                isAnimationActive={false} // Reduce motion for accessibility
                aria-label="Your app performance metrics"
              />
              <Bar 
                dataKey="industry" 
                name="Industry Average" 
                fill="#4C51BF"
                isAnimationActive={false} // Reduce motion for accessibility
                aria-label="Industry average metrics"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SkeletonWrapper>

      {/* Supplementary textual information */}
      <SkeletonWrapper 
        isLoading={isLoading} 
        className="mt-4 space-y-2"
        items={Array(3).fill(0).map(() => ({ height: "40px", width: "100%", className: "rounded-md" }))}
      >
        <div className="mt-4 space-y-2">
          {comparativeData.map((item, index) => (
            <div 
              key={index} 
              className={`p-2 rounded flex justify-between items-center ${focusedIndex === index ? 'bg-white/10' : ''}`}
              id={`comp-item-${index}`}
            >
              <span className="text-white">{item.metric}</span>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full bg-[#9b87f5]" aria-hidden="true"></div>
                  <span className="text-white">{item.current}%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-2 rounded-full bg-[#4C51BF]" aria-hidden="true"></div>
                  <span className="text-white">{item.industry}%</span>
                </div>
                <span className={`text-xs ${item.current > item.industry ? 'text-green-400' : 'text-red-400'}`}>
                  {item.current > item.industry ? '+' : ''}{(item.current - item.industry).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </SkeletonWrapper>
    </Card>
  );
}
