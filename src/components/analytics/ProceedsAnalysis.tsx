import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics, formatMetric } from "@/utils/analytics/processAnalysis";

interface ProceedsAnalysisProps {
  data: ProcessedAnalytics;
}

export function ProceedsAnalysis({ data }: ProceedsAnalysisProps) {
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

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Revenue Analysis</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
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
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="revenuePerUser" 
              stroke="#4C51BF" 
              strokeWidth={2}
              name="revenuePerUser"
            />
          </LineChart>
        </ResponsiveContainer>
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
