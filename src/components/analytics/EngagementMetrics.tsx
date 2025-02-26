
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface EngagementMetricsProps {
  data: ProcessedAnalytics;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  const engagementData = [
    {
      metric: "Sessions per Device",
      value: data.engagement.sessionsPerDevice.value,
      change: data.engagement.sessionsPerDevice.change
    },
    {
      metric: "Day 1 Retention",
      value: data.engagement.retention.day1.value,
      benchmark: data.engagement.retention.day1.benchmark
    },
    {
      metric: "Day 7 Retention",
      value: data.engagement.retention.day7.value,
      benchmark: data.engagement.retention.day7.benchmark
    }
  ];

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">User Engagement Analysis</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
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
            <Bar dataKey="value" name="Actual" fill="#9b87f5" />
            <Bar dataKey="benchmark" name="Benchmark" fill="#4C51BF" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
