
import { Card } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PerformancePanelProps {
  data: ProcessedAnalytics;
  compact?: boolean;
}

export function PerformancePanel({ data, compact = false }: PerformancePanelProps) {
  // Create sample crash data
  const crashTrend = [
    { day: "Mon", crashes: data.technical.crashes.value * 1.2 / 7 },
    { day: "Tue", crashes: data.technical.crashes.value * 0.9 / 7 },
    { day: "Wed", crashes: data.technical.crashes.value * 1.1 / 7 },
    { day: "Thu", crashes: data.technical.crashes.value * 0.85 / 7 },
    { day: "Fri", crashes: data.technical.crashes.value * 1.3 / 7 },
    { day: "Sat", crashes: data.technical.crashes.value * 1.5 / 7 },
    { day: "Sun", crashes: data.technical.crashes.value * 1.0 / 7 },
  ];
  
  // Determine if crash metrics are improving
  const isImproving = data.technical.crashes.change < 0;
  
  // Get percentile information
  const percentile = data.technical.crashRate.percentile || "Average";
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-rose-400" />
          Technical Performance
        </h3>
        {!compact && (
          <div className="flex items-center gap-1 text-white/70">
            <span className="text-sm font-medium">Crash Rate</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {data.technical.crashRate.value.toFixed(2)}%
            </div>
          </div>
        )}
      </div>
      
      {compact ? (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crashTrend}>
              <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip
                formatter={(value: number) => value.toFixed(1)}
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white' 
                }}
              />
              <Line type="monotone" dataKey="crashes" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Target className="h-4 w-4 text-rose-400 mr-2" />
                <span className="text-sm text-white/70">Total Crashes</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {data.technical.crashes.value}
              </div>
              <div className={`text-xs mt-1 ${data.technical.crashes.change < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.technical.crashes.change > 0 ? '+' : ''}{data.technical.crashes.change}%
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Activity className="h-4 w-4 text-amber-400 mr-2" />
                <span className="text-sm text-white/70">Crash Rate</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {data.technical.crashRate.value.toFixed(2)}%
              </div>
              <div className="text-xs text-white/60 mt-1">
                {percentile} in category
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white/70">Crash Trend (Last 7 Days)</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crashTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    formatter={(value: number) => value.toFixed(1)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white' 
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="crashes"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f43f5e' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            isImproving 
              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20' 
              : 'bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-white/70">Stability Status</h4>
                <p className="text-lg font-semibold text-white mt-1">
                  {isImproving ? 'Improving' : 'Attention Needed'}
                </p>
                <p className="text-xs text-white/50">
                  {isImproving 
                    ? 'Crashes are decreasing, good job!' 
                    : 'Crashes are increasing, review recent changes'}
                </p>
              </div>
              {isImproving 
                ? <CheckCircle className="h-6 w-6 text-emerald-400" />
                : <AlertTriangle className="h-6 w-6 text-amber-400" />
              }
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
