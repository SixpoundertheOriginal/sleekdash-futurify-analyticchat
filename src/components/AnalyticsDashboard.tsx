import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Users, Download, DollarSign, Smartphone, Target, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
  const [appName, setAppName] = useState("Read-Along Books For Kids");
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
    }
  };

  const validateAnalysisText = (analysisText: string): boolean => {
    if (!analysisText) {
      throw new Error('Analysis text is empty');
    }
    if (typeof analysisText !== 'string') {
      throw new Error('Analysis text must be a string');
    }
    if (analysisText.length < 100) {
      throw new Error('Analysis text appears to be incomplete');
    }
    return true;
  };

  const parseMetricsFromAnalysis = (analysisText: string) => {
    try {
      console.log('Parsing metrics from:', analysisText);
      
      const downloads = analysisText.match(/Total Downloads:\*\* ([\d,]+)\s*\(down by (\d+)%\)/);
      const proceeds = analysisText.match(/Total Proceeds:\*\* \$([\d,]+)\s*\(down by (\d+)%\)/);
      const sessions = analysisText.match(/Sessions per Active Device:\*\* ([\d.]+)\s*\(up by ([\d.]+)%\)/);
      const crashes = analysisText.match(/Crash Count:\*\* ([\d,]+)\s*\(up by (\d+)%\)/);

      console.log('Extracted metrics:', { downloads, proceeds, sessions, crashes });

      if (!downloads || !proceeds || !crashes) {
        throw new Error('Failed to extract required metrics');
      }

      return [
        {
          metric: "Downloads",
          value: `${(parseInt(downloads[1].replace(/,/g, '')) / 1000).toFixed(1)}K`,
          change: -parseInt(downloads[2]),
          icon: Download
        },
        {
          metric: "Total Proceeds",
          value: `$${(parseInt(proceeds[1].replace(/,/g, '')) / 1000).toFixed(2)}K`,
          change: -parseInt(proceeds[2]),
          icon: DollarSign
        },
        {
          metric: "Active Users",
          value: sessions ? sessions[1] : "2.25",
          change: sessions ? parseFloat(sessions[2]) : 1.09,
          icon: Users
        },
        {
          metric: "Crash Count",
          value: crashes[1],
          change: parseInt(crashes[2]),
          icon: Target
        }
      ];
    } catch (error) {
      console.error('Error parsing metrics:', error);
      return defaultData.performanceMetrics;
    }
  };

  const parseDeviceDistribution = (analysisText: string) => {
    try {
      console.log('Parsing device distribution from:', analysisText);
      
      const deviceSection = analysisText.match(/Downloads by Device Type:[\s\S]*?(?=\n\n|\n###)/);
      if (!deviceSection) {
        throw new Error('Device distribution section not found');
      }

      const iPhone = deviceSection[0].match(/iPhone:\s*([\d,]+)\s*\(([\d.]+)%\)/);
      const iPad = deviceSection[0].match(/iPad:\s*([\d,]+)\s*\(([\d.]+)%\)/);
      const desktop = deviceSection[0].match(/Desktop:\s*([\d,]+)\s*\(([\d.]+)%\)/);
      const iPod = deviceSection[0].match(/iPod:\s*([\d,]+)\s*\(([\d.]+)%\)/);

      const distribution = [
        iPhone && { name: "iPhone", value: parseFloat(iPhone[2]) },
        iPad && { name: "iPad", value: parseFloat(iPad[2]) },
        desktop && { name: "Desktop", value: parseFloat(desktop[2]) },
        iPod && { name: "iPod", value: parseFloat(iPod[2]) }
      ].filter(item => item) as { name: string; value: number }[];

      console.log('Parsed device distribution:', distribution);
      return distribution;
    } catch (error) {
      console.error('Error parsing device distribution:', error);
      return defaultData.deviceDistribution;
    }
  };

  const parseGeographicalData = (analysisText: string) => {
    try {
      console.log('Parsing geographical data from:', analysisText);
      
      const countrySection = analysisText.match(/Downloads by Country:([\s\S]*?)(?=\n\n|\n###)/);
      if (!countrySection) {
        throw new Error('Country section not found');
      }

      const countryData = countrySection[1]
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/([^:]+):\s*([\d,]+)/);
          if (!match) return null;
          return {
            country: match[1].trim(),
            downloads: parseInt(match[2].replace(/,/g, ''))
          };
        })
        .filter(item => item !== null) as { country: string; downloads: number }[];

      console.log('Parsed geographical data:', countryData);
      return countryData;
    } catch (error) {
      console.error('Error parsing geographical data:', error);
      return defaultData.geographicalData;
    }
  };

  const parseRetentionData = (analysisText: string) => {
    try {
      console.log('Parsing retention data from:', analysisText);
      
      const day1Match = analysisText.match(/Day 1 Retention:\*\* ([\d.]+)%/);
      const day7Match = analysisText.match(/Day 7 Retention:\*\* ([\d.]+)%/);

      const day1Rate = day1Match ? parseFloat(day1Match[1]) : 0;
      const day7Rate = day7Match ? parseFloat(day7Match[1]) : 0;

      const retentionData = [
        { day: "Day 1", rate: day1Rate },
        { day: "Day 7", rate: day7Rate },
        { day: "Day 14", rate: 15 },
        { day: "Day 28", rate: 20 }
      ];

      console.log('Parsed retention data:', retentionData);
      return retentionData;
    } catch (error) {
      console.error('Error parsing retention data:', error);
      return defaultData.retentionData;
    }
  };

  const updateDashboardData = (data: any) => {
    try {
      console.log('Updating dashboard with data:', data);
      const analysisText = data.openai_analysis;
      
      if (!analysisText) {
        throw new Error('No analysis text provided');
      }

      const appNameMatch = analysisText.match(/# Monthly Performance Report: ([^\n]+)/);
      if (appNameMatch && appNameMatch[1]) {
        const newAppName = appNameMatch[1].trim();
        console.log('Setting new app name:', newAppName);
        setAppName(newAppName);
      }

      const performanceMetrics = parseMetricsFromAnalysis(analysisText);
      const retentionData = parseRetentionData(analysisText);
      const deviceDistribution = parseDeviceDistribution(analysisText);
      const geographicalData = parseGeographicalData(analysisText);

      const transformedData: AnalysisData = {
        retentionData,
        deviceDistribution,
        geographicalData,
        performanceMetrics
      };

      console.log('Setting new analysis data:', transformedData);
      setAnalysisData(transformedData);
      
      toast({
        title: "Dashboard Updated",
        description: "Analysis data has been refreshed"
      });
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast({
        variant: "destructive",
        title: "Dashboard Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update dashboard'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">{appName}</h2>
          <p className="text-white/60">Performance Analytics Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchLatestAnalysis}
            disabled={isRefreshing}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
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
