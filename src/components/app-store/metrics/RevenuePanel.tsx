
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatMetric } from "@/utils/analytics/formatting";

interface RevenuePanelProps {
  data: ProcessedAnalytics;
  compact?: boolean;
}

export function RevenuePanel({ data, compact = false }: RevenuePanelProps) {
  // Sample data for the charts
  const revenueData = [
    { name: "Week 1", value: data.financial.proceeds.value * 0.85 },
    { name: "Week 2", value: data.financial.proceeds.value * 0.9 },
    { name: "Week 3", value: data.financial.proceeds.value * 0.95 },
    { name: "Week 4", value: data.financial.proceeds.value }
  ];
  
  // Breakdown of revenue by type (sample data)
  const revenueTypeData = [
    { name: "Subscriptions", value: data.financial.proceeds.value * 0.65 },
    { name: "In-App Purchases", value: data.financial.proceeds.value * 0.25 },
    { name: "Paid Downloads", value: data.financial.proceeds.value * 0.1 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          Revenue Performance
        </h3>
        {!compact && (
          <div className="flex items-center gap-1 text-white/70">
            <span className="text-sm font-medium">Total Revenue</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {formatMetric(data.financial.proceeds.value, 'currency')}
              <span className={data.financial.proceeds.change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {data.financial.proceeds.change > 0 ? '↑' : '↓'} {Math.abs(data.financial.proceeds.change)}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {compact ? (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip
                formatter={(value: number) => formatMetric(value, 'currency')}
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white' 
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <DollarSign className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm text-white/70">Total Proceeds</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatMetric(data.financial.proceeds.value, 'currency')}
              </div>
              <div className={`text-xs mt-1 ${data.financial.proceeds.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.financial.proceeds.change > 0 ? '+' : ''}{data.financial.proceeds.change}%
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Wallet className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-sm text-white/70">Revenue Per User</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatMetric(data.financial.proceedsPerUser.value, 'currency')}
              </div>
              <div className={`text-xs mt-1 ${data.financial.proceedsPerUser.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.financial.proceedsPerUser.change > 0 ? '+' : ''}{data.financial.proceedsPerUser.change}%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    formatter={(value: number) => formatMetric(value, 'currency')}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatMetric(value, 'currency')}
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
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-white/70">Revenue Growth Trend</h4>
                <p className="text-lg font-semibold text-white mt-1">
                  {data.financial.proceeds.change > 0 ? '+' : ''}{data.financial.proceeds.change}%
                </p>
                <p className="text-xs text-white/50">Revenue is {data.financial.proceeds.change > 0 ? 'growing' : 'declining'}</p>
              </div>
              <TrendingUp className={`h-6 w-6 ${data.financial.proceeds.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
