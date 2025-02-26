
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface RetentionChartProps {
  data: ProcessedAnalytics;
}

export function RetentionChart({ data }: RetentionChartProps) {
  const retentionData = [
    { day: "Day 1", actual: data.engagement.retention.day1.value, benchmark: data.engagement.retention.day1.benchmark },
    { day: "Day 7", actual: data.engagement.retention.day7.value, benchmark: data.engagement.retention.day7.benchmark },
  ];

  if (data.engagement.retention.day14) {
    retentionData.push({
      day: "Day 14",
      actual: data.engagement.retention.day14.value,
      benchmark: data.engagement.retention.day14.benchmark
    });
  }

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">User Retention vs Benchmark</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#9b87f5" 
              strokeWidth={2}
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="#4C51BF" 
              strokeWidth={2}
              name="Benchmark"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
