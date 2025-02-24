
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartBar, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

// Sample data - replace with real data from your analytics
const performanceData = [
  { month: "Jan", impressions: 1200, conversions: 180, revenue: 5400 },
  { month: "Feb", impressions: 1350, conversions: 210, revenue: 6300 },
  { month: "Mar", impressions: 1500, conversions: 250, revenue: 7500 },
  { month: "Apr", impressions: 1800, conversions: 300, revenue: 9000 },
  { month: "May", impressions: 2100, conversions: 350, revenue: 10500 },
  { month: "Jun", impressions: 2400, conversions: 400, revenue: 12000 },
];

const categoryData = [
  { name: "Games", value: 35 },
  { name: "Social", value: 25 },
  { name: "Productivity", value: 20 },
  { name: "Education", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ['#9b87f5', '#D6BCFA', '#7F9CF5', '#B794F4', '#9F7AEA'];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6months");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Analytics Dashboard</h2>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Performance Trends</h3>
          </div>
          <div className="h-[300px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
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
                  dataKey="impressions" 
                  stroke="#9b87f5" 
                  strokeWidth={2}
                  dot={{ fill: "#9b87f5" }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#D6BCFA" 
                  strokeWidth={2}
                  dot={{ fill: "#D6BCFA" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <ChartBar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Revenue Analysis</h3>
          </div>
          <div className="h-[300px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white' 
                  }}
                />
                <Bar dataKey="revenue" fill="#9b87f5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Category Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
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
      </div>
    </div>
  );
}
