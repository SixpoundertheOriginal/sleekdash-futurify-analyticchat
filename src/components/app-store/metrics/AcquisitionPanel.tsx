
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Download, Eye, Sparkles } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { formatMetric } from "@/utils/analytics/formatting";

interface AcquisitionPanelProps {
  data: ProcessedAnalytics;
  compact?: boolean;
}

export function AcquisitionPanel({ data, compact = false }: AcquisitionPanelProps) {
  // Create sample acquisition funnel data
  const funnelData = [
    { name: "Impressions", value: data.acquisition.impressions.value },
    { name: "Page Views", value: data.acquisition.pageViews.value },
    { name: "Downloads", value: data.acquisition.downloads.value }
  ];
  
  // Create sample trend data
  const trendData = [
    { name: "Week 1", impressions: data.acquisition.impressions.value * 0.85, downloads: data.acquisition.downloads.value * 0.8 },
    { name: "Week 2", impressions: data.acquisition.impressions.value * 0.9, downloads: data.acquisition.downloads.value * 0.85 },
    { name: "Week 3", impressions: data.acquisition.impressions.value * 0.95, downloads: data.acquisition.downloads.value * 0.9 },
    { name: "Week 4", impressions: data.acquisition.impressions.value, downloads: data.acquisition.downloads.value },
  ];
  
  // Format conversion rates
  const conversionRate = data.acquisition.conversionRate.value.toFixed(2);
  const change = data.acquisition.conversionRate.change;
  
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-primary/80" />
          Acquisition Performance
        </h3>
        {!compact && (
          <div className="flex items-center gap-1 text-white/70">
            <span className="text-sm font-medium">Conversions</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {conversionRate}%
              <span className={change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {compact ? (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" barCategoryGap={8}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => formatMetric(value, 'number')}
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white' 
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#8884d8' : index === 1 ? '#83a6ed' : '#8dd1e1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Eye className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-white/70">Impressions</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatMetric(data.acquisition.impressions.value, 'number')}
              </div>
              <div className={`text-xs mt-1 ${data.acquisition.impressions.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.acquisition.impressions.change > 0 ? '+' : ''}{data.acquisition.impressions.change}%
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-white/70">Page Views</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatMetric(data.acquisition.pageViews.value, 'number')}
              </div>
              <div className={`text-xs mt-1 ${data.acquisition.pageViews.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.acquisition.pageViews.change > 0 ? '+' : ''}{data.acquisition.pageViews.change}%
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center mb-1">
                <Download className="h-4 w-4 text-teal-400 mr-2" />
                <span className="text-sm text-white/70">Downloads</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {formatMetric(data.acquisition.downloads.value, 'number')}
              </div>
              <div className={`text-xs mt-1 ${data.acquisition.downloads.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.acquisition.downloads.change > 0 ? '+' : ''}{data.acquisition.downloads.change}%
              </div>
            </div>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  formatter={(value: number) => formatMetric(value, 'number')}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white' 
                  }}
                />
                <Area type="monotone" dataKey="impressions" stroke="#8884d8" fillOpacity={1} fill="url(#colorImpressions)" />
                <Area type="monotone" dataKey="downloads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDownloads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div>
              <h4 className="text-sm text-white/70">Funnel Efficiency</h4>
              <p className="text-lg font-semibold text-white mt-1">
                {data.acquisition.funnelMetrics.viewsToDownloads.toFixed(1)}%
              </p>
              <p className="text-xs text-white/50">Views-to-downloads conversion</p>
            </div>
            <ArrowUpRight className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
      )}
    </Card>
  );
}
