import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Users, Download, DollarSign, Smartphone, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisData {
  retentionData: Array<{ day: string; rate: number }>;
  deviceDistribution: Array<{ name: string; value: number }>;
  geographicalData: Array<{ country: string; downloads: number }>;
  performanceMetrics: Array<{
    metric: string;
    value: string;
    change: number;
    icon: any;
  }>;
}

const defaultData: AnalysisData = {
  retentionData: [
    { day: "Day 1", rate: 5 },
    { day: "Day 7", rate: 10 },
    { day: "Day 14", rate: 15 },
    { day: "Day 28", rate: 20 },
  ],
  deviceDistribution: [
    { name: "iPad", value: 59.4 },
    { name: "iPhone", value: 39.5 },
    { name: "Other", value: 1.1 },
  ],
  geographicalData: [
    { country: "United States", downloads: 6825 },
    { country: "United Kingdom", downloads: 691 },
    { country: "Canada", downloads: 506 },
  ],
  performanceMetrics: [
    {
      metric: "Downloads",
      value: "11.9K",
      change: -19,
      icon: Download
    },
    {
      metric: "Total Proceeds",
      value: "$9.89K",
      change: -12,
      icon: DollarSign
    },
    {
      metric: "Active Users",
      value: "2.37",
      change: 0.6,
      icon: Users
    },
    {
      metric: "Crash Count",
      value: "62",
      change: -23,
      icon: Target
    }
  ]
};

const COLORS = ['#9b87f5', '#D6BCFA', '#7F9CF5'];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");
  const [analysisData, setAnalysisData] = useState<AnalysisData>(defaultData);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('keyword-analyses-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'keyword_analyses'
        },
        (payload) => {
          console.log('New analysis data received:', payload);
          if (payload.new) {
            updateDashboardData(payload.new);
          }
        }
      )
      .subscribe();

    fetchLatestAnalysis();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeRange]);

  const fetchLatestAnalysis = async () => {
    try {
      const { data: analysisResult, error } = await supabase
        .from('keyword_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (analysisResult?.[0]) {
        updateDashboardData(analysisResult[0]);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analysis data"
      });
    }
  };

  const parseMetricsFromAnalysis = (analysisText: string) => {
    try {
      const impressionsMatch = analysisText.match(/Impressions:\*\* ([\d,]+) \(([-+]\d+%)\)/);
      const pageViewsMatch = analysisText.match(/Product Page Views:\*\* ([\d,]+) \(([-+]\d+%)\)/);
      const conversionMatch = analysisText.match(/Conversion Rate:\*\* ([\d.]+)% \(([-+]\d+%)\)/);

      const impressions = impressionsMatch ? parseInt(impressionsMatch[1].replace(/,/g, '')) : 0;
      const impressionsChange = impressionsMatch ? parseInt(impressionsMatch[2]) : 0;
      const pageViews = pageViewsMatch ? parseInt(pageViewsMatch[1].replace(/,/g, '')) : 0;
      const pageViewsChange = pageViewsMatch ? parseInt(pageViewsMatch[2]) : 0;
      const conversionRate = conversionMatch ? parseFloat(conversionMatch[1]) : 0;
      const conversionChange = conversionMatch ? parseInt(conversionMatch[2]) : 0;

      return [
        {
          metric: "Impressions",
          value: `${(impressions / 1000).toFixed(1)}K`,
          change: impressionsChange,
          icon: Users
        },
        {
          metric: "Page Views",
          value: `${(pageViews / 1000).toFixed(1)}K`,
          change: pageViewsChange,
          icon: Smartphone
        },
        {
          metric: "Conversion Rate",
          value: `${conversionRate}%`,
          change: conversionChange,
          icon: Target
        },
        {
          metric: "Revenue",
          value: "Calculate from available data",
          change: 0,
          icon: DollarSign
        }
      ];
    } catch (error) {
      console.error('Error parsing metrics:', error);
      return defaultData.performanceMetrics;
    }
  };

  const updateDashboardData = (data: any) => {
    try {
      const analysisText = data.openai_analysis;
      if (!analysisText) {
        throw new Error('No analysis text found in the data');
      }

      const performanceMetrics = parseMetricsFromAnalysis(analysisText);

      const transformedData: AnalysisData = {
        retentionData: defaultData.retentionData,
        deviceDistribution: defaultData.deviceDistribution,
        geographicalData: defaultData.geographicalData,
        performanceMetrics
      };

      setAnalysisData(transformedData);
      
      toast({
        title: "Dashboard Updated",
        description: "Analysis data has been refreshed from the latest report"
      });

      console.log('Parsed performance metrics:', performanceMetrics);
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to parse analysis data"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Read-Along Books For Kids</h2>
          <p className="text-white/60">Performance Analytics Dashboard</p>
        </div>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        {analysisData.performanceMetrics.map((metric, index) => (
          <Card key={index} className="p-6 bg-white/5 border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-white/60">{metric.metric}</p>
                <h3 className="text-2xl font-semibold text-white mt-1">{metric.value}</h3>
              </div>
              <div className={`flex items-center gap-1 ${
                metric.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm">{Math.abs(metric.change)}%</span>
              </div>
            </div>
            <div className="mt-4">
              <metric.icon className="h-8 w-8 text-primary/40" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Retention Chart */}
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="font-semibold text-white mb-4">User Retention</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysisData.retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
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
                  dataKey="rate" 
                  stroke="#9b87f5" 
                  strokeWidth={2}
                  dot={{ fill: "#9b87f5" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Geographical Distribution */}
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="font-semibold text-white mb-4">Downloads by Country</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.geographicalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="country" type="category" stroke="rgba(255,255,255,0.5)" width={100} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white' 
                  }}
                />
                <Bar dataKey="downloads" fill="#9b87f5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Device Distribution */}
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="font-semibold text-white mb-4">Device Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysisData.deviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analysisData.deviceDistribution.map((entry, index) => (
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

        {/* Technical Performance */}
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="font-semibold text-white mb-4">Technical Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Crash Count</span>
                <span className="text-green-400">-23%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <div className="h-full w-[77%] bg-primary rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Sessions per Active Device</span>
                <span className="text-green-400">+0.6%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full">
                <div className="h-full w-[60%] bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
