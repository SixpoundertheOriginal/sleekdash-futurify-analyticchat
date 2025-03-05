
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/types";
import { formatMetric } from "@/utils/analytics/formatting";

interface ImpressionAnalyticsProps {
  data: ProcessedAnalytics;
}

export function ImpressionAnalytics({ data }: ImpressionAnalyticsProps) {
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

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Impression & View Analysis</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={impressionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
              formatter={(value: number) => [formatMetric(value), 'Count']}
            />
            <Area 
              type="monotone" 
              dataKey="impressions" 
              stackId="1"
              stroke="#9b87f5" 
              fill="#9b87f5" 
              fillOpacity={0.3}
              name="Impressions"
            />
            <Area 
              type="monotone" 
              dataKey="views" 
              stackId="1"
              stroke="#4C51BF" 
              fill="#4C51BF" 
              fillOpacity={0.3}
              name="Views"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
