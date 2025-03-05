
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatMetric } from "@/utils/analytics/formatting";

interface GeographicalDistributionProps {
  data: ProcessedAnalytics;
}

export function GeographicalDistribution({ data }: GeographicalDistributionProps) {
  // Prepare geographical data
  const markets = data.geographical.markets.slice(0, 5).map(market => ({
    name: market.country,
    value: market.downloads,
    percentage: market.percentage
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-400" />
          Top Markets
        </h3>
      </div>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={markets}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {markets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatMetric(value, 'number')}
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {markets.slice(0, 3).map((market, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm text-white/70">{market.name}</span>
            </div>
            <div className="text-sm text-white/80">
              {formatMetric(market.value, 'number')} ({market.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
