
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useRef } from "react";

interface GeographicalDistributionProps {
  data: ProcessedAnalytics;
}

export function GeographicalDistribution({ data }: GeographicalDistributionProps) {
  const COLORS = ['#9b87f5', '#7F9CF5', '#4C51BF', '#6366F1'];
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Accessible table representation of the data
  const tableData = data.geographical.markets.map((market, index) => ({
    country: market.country,
    downloads: market.downloads,
    percentage: ((market.downloads / data.acquisition.downloads.value) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="geo-distribution-title">Downloads by Country</h3>
      
      {/* Screen reader only table with the data */}
      <div className="sr-only">
        <table aria-labelledby="geo-distribution-title">
          <caption>Geographical distribution of app downloads</caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Downloads</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, i) => (
              <tr key={i}>
                <td>{item.country}</td>
                <td>{item.downloads}</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div 
        className="h-[300px]" 
        ref={chartRef}
        role="img"
        aria-labelledby="geo-distribution-title"
        tabIndex={0}
      >
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
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  aria-label={`${entry.country}: ${((entry.downloads / data.acquisition.downloads.value) * 100).toFixed(1)}% of downloads`}
                />
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
      
      {/* Visible data representation for better accessibility */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
        {tableData.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-white/90">{item.country}: </span>
            <span className="text-white font-medium">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
