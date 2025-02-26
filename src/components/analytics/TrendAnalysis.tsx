
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { formatMetric } from "@/utils/analytics/processAnalysis";

interface TrendAnalysisProps {
  data: ProcessedAnalytics;
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  // Simulate historical data based on current values and changes
  const generateHistoricalData = (value: number, change: number) => {
    const points = 12; // Last 12 periods
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

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Downloads Trend Analysis</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={downloadsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="period" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
              formatter={(value: number) => [formatMetric(value, 'number'), 'Downloads']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#9b87f5" 
              strokeWidth={2}
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#4C51BF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
