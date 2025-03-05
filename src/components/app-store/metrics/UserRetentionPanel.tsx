
import { Card } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

interface UserRetentionPanelProps {
  data: ProcessedAnalytics;
  compact?: boolean;
}

export function UserRetentionPanel({ data, compact = false }: UserRetentionPanelProps) {
  // Prepare retention data
  const retentionData = [
    { 
      day: "Day 1", 
      retention: data.engagement.retention.day1.value,
      benchmark: data.engagement.retention.day1.benchmark
    },
    { 
      day: "Day 7", 
      retention: data.engagement.retention.day7.value,
      benchmark: data.engagement.retention.day7.benchmark 
    }
  ];
  
  // Add Day 14 if available
  if (data.engagement.retention.day14 && data.engagement.retention.day14.value) {
    retentionData.push({
      day: "Day 14",
      retention: data.engagement.retention.day14.value,
      benchmark: data.engagement.retention.day14.benchmark || null
    });
  }
  
  // Add Day 28 if available
  if (data.engagement.retention.day28 && data.engagement.retention.day28.value) {
    retentionData.push({
      day: "Day 28",
      retention: data.engagement.retention.day28.value,
      benchmark: data.engagement.retention.day28.benchmark || null
    });
  }
  
  // Sample user engagement data
  const engagementTrend = [
    { day: "Mon", sessions: 3.8 },
    { day: "Tue", sessions: 4.2 },
    { day: "Wed", sessions: 3.9 },
    { day: "Thu", sessions: 4.5 },
    { day: "Fri", sessions: 5.1 },
    { day: "Sat", sessions: 5.6 },
    { day: "Sun", sessions: 4.8 },
  ];
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          User Retention & Engagement
        </h3>
        {!compact && (
          <div className="flex items-center gap-1 text-white/70">
            <span className="text-sm font-medium">Day 1 Retention</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {data.engagement.retention.day1.value.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
      
      {compact ? (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData} barCategoryGap={20}>
              <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white' 
                }}
              />
              <Bar dataKey="retention" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" fill="#4b5563" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-white/70">Day 1 Retention</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {data.engagement.retention.day1.value.toFixed(1)}%
              </div>
              <div className="text-xs text-white/60 mt-1">
                Industry avg: {data.engagement.retention.day1.benchmark?.toFixed(1) || '~25'}%
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <User className="h-4 w-4 text-indigo-400 mr-2" />
                <span className="text-sm text-white/70">Sessions / Device</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {data.engagement.sessionsPerDevice.value.toFixed(2)}
              </div>
              <div className={`text-xs mt-1 ${data.engagement.sessionsPerDevice.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.engagement.sessionsPerDevice.change > 0 ? '+' : ''}{data.engagement.sessionsPerDevice.change}%
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white/70">Retention Rates</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retentionData} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white' 
                    }}
                  />
                  <Bar name="Your App" dataKey="retention" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar name="Industry Benchmark" dataKey="benchmark" fill="#4b5563" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white/70">Sessions per Device Trend</h4>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTrend}>
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
                    dataKey="sessions"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
