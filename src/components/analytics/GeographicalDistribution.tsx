
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface GeographicalDistributionProps {
  data: ProcessedAnalytics;
}

export function GeographicalDistribution({ data }: GeographicalDistributionProps) {
  const COLORS = ['#9b87f5', '#7F9CF5', '#4C51BF', '#6366F1'];

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Downloads by Country</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.geographical.markets}
              dataKey="downloads"
              nameKey="country"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ country, percent }) => `${country} ${(percent * 100).toFixed(1)}%`}
            >
              {data.geographical.markets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
