
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface ConversionFunnelProps {
  data: ProcessedAnalytics;
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
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

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Conversion Funnel</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical">
            <XAxis type="number" tick={{ fill: '#9ca3af' }} />
            <YAxis dataKey="stage" type="category" tick={{ fill: '#9ca3af' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Bar dataKey="value" fill="#9b87f5" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
