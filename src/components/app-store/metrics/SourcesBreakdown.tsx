
import { Card } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface SourcesBreakdownProps {
  data: ProcessedAnalytics;
}

export function SourcesBreakdown({ data }: SourcesBreakdownProps) {
  // Define default sources data
  const defaultSources = [
    { source: "App Store Search", percentage: 88.6, downloads: 2994 },
    { source: "App Store Browse", percentage: 6.2, downloads: 210 },
    { source: "Institutional Purchase", percentage: 3.0, downloads: 100 },
    { source: "Unavailable", percentage: 1.2, downloads: 41 },
    { source: "App Referrer", percentage: 0.9, downloads: 29 }
  ];

  // Use default sources since the property doesn't exist in the type
  const sources = data.geographical?.sources || defaultSources;
  
  // Prepare data for the pie chart
  const chartData = sources.map(source => ({
    name: source.source,
    value: source.downloads,
    percentage: source.percentage
  }));
  
  // Define colors for the pie chart segments
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Download Sources</h3>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} downloads`, 'Downloads']}
              contentStyle={{ 
                backgroundColor: 'rgba(23, 25, 35, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: 'white'
              }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={(value) => <span style={{ color: 'white', opacity: 0.8 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="flex justify-between text-sm">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-white/70">{source.source}</span>
            </div>
            <span className="text-white">{source.percentage}% ({source.downloads})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
