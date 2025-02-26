
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface ComparativeAnalysisProps {
  data: ProcessedAnalytics;
}

export function ComparativeAnalysis({ data }: ComparativeAnalysisProps) {
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

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Industry Comparison</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparativeData}>
            <XAxis dataKey="metric" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Legend />
            <Bar dataKey="current" name="Your App" fill="#9b87f5" />
            <Bar dataKey="industry" name="Industry Average" fill="#4C51BF" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
