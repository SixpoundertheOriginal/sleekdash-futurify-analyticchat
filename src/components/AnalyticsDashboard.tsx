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

  const parseRetentionData = (analysisText: string) => {
    try {
      const day1Match = analysisText.match(/Day 1 Retention:\*\* ([\d.]+)%/);
      const day7Match = analysisText.match(/Day 7 Retention:\*\* ([\d.]+)%/);
      
      if (!day1Match && !day7Match) {
        throw new Error('No retention data found in analysis');
      }

      const day1Rate = day1Match ? parseFloat(day1Match[1]) : 0;
      const day7Rate = day7Match ? parseFloat(day7Match[1]) : 0;

      if (isNaN(day1Rate) || isNaN(day7Rate)) {
        throw new Error('Invalid retention rate values');
      }

      if (day1Rate < 0 || day1Rate > 100 || day7Rate < 0 || day7Rate > 100) {
        throw new Error('Retention rates must be between 0 and 100');
      }

      return [
        { day: "Day 1", rate: day1Rate },
        { day: "Day 7", rate: day7Rate },
        { day: "Day 14", rate: 15 },
        { day: "Day 28", rate: 20 }
      ];
    } catch (error) {
      console.error('Error parsing retention data:', error);
      toast({
        variant: "destructive",
        title: "Retention Data Error",
        description: `Failed to parse retention data: ${error.message}`
      });
      return defaultData.retentionData;
    }
  };

  const parseDeviceDistribution = (analysisText: string) => {
    try {
      const deviceSection = analysisText.match(/Downloads by Device Type:[\s\S]*?(?=\n\n|\n###)/);
      if (!deviceSection) {
        throw new Error('Device distribution section not found');
      }

      const devices = deviceSection[0].match(/(\w+):\s*([\d,]+)\s*\(([\d.]+)%\)/g);
      if (!devices || devices.length === 0) {
        throw new Error('No device data found in expected format');
      }

      const distribution = devices.map(device => {
        const matches = device.match(/(\w+):\s*([\d,]+)\s*\(([\d.]+)%\)/);
        if (!matches) {
          throw new Error(`Invalid device data format: ${device}`);
        }

        const [, name, , percentage] = matches;
        const value = parseFloat(percentage);

        if (isNaN(value)) {
          throw new Error(`Invalid percentage value for device ${name}`);
        }

        return { name, value };
      });

      const totalPercentage = distribution.reduce((sum, item) => sum + item.value, 0);
      if (Math.abs(totalPercentage - 100) > 1) {
        throw new Error('Device distribution percentages do not sum to 100%');
      }

      return distribution;
    } catch (error) {
      console.error('Error parsing device distribution:', error);
      toast({
        variant: "destructive",
        title: "Device Distribution Error",
        description: `Failed to parse device data: ${error.message}`
      });
      return defaultData.deviceDistribution;
    }
  };

  const parseGeographicalData = (analysisText: string) => {
    try {
      const geoSection = analysisText.match(/Downloads by Country:[\s\S]*?(?=\n\n|\n###)/);
      if (!geoSection) {
        throw new Error('Geographical data section not found');
      }

      const countries = geoSection[0].match(/([A-Za-z\s]+):\s*([\d,]+)/g);
      if (!countries || countries.length === 0) {
        throw new Error('No country data found in expected format');
      }

      const geoData = countries.map(country => {
        const matches = country.match(/([A-Za-z\s]+):\s*([\d,]+)/);
        if (!matches) {
          throw new Error(`Invalid country data format: ${country}`);
        }

        const [, name, downloads] = matches;
        const downloadCount = parseInt(downloads.replace(/,/g, ''));

        if (isNaN(downloadCount)) {
          throw new Error(`Invalid download count for country ${name}`);
        }

        if (downloadCount < 0) {
          throw new Error(`Negative download count for country ${name}`);
        }

        return {
          country: name.trim(),
          downloads: downloadCount
        };
      });

      if (geoData.length === 0) {
        throw new Error('No valid geographical data found');
      }

      return geoData.slice(0, 5);
    } catch (error) {
      console.error('Error parsing geographical data:', error);
      toast({
        variant: "destructive",
        title: "Geographical Data Error",
        description: `Failed to parse country data: ${error.message}`
      });
      return defaultData.geographicalData;
    }
  };

  const parseMetricsFromAnalysis = (analysisText: string) => {
    try {
      const metrics = {
        impressions: analysisText.match(/Impressions:\*\* ([\d,]+) \(([-+]\d+)%\)/),
        pageViews: analysisText.match(/Product Page Views:\*\* ([\d,]+) \(([-+]\d+)%\)/),
        proceeds: analysisText.match(/Total Proceeds:\*\* \$([\d,]+) \(([-+]\d+)%\)/),
        crashes: analysisText.match(/Crash Count:\*\* ([\d,]+) \(([-+]\d+)%\)/)
      };

      if (!Object.values(metrics).some(match => match !== null)) {
        throw new Error('No valid metrics found in analysis');
      }

      const parseMetricValue = (match: RegExpMatchArray | null, prefix: string = ''): { value: string; change: number } => {
        if (!match) {
          throw new Error('Metric data not found');
        }

        const rawValue = parseInt(match[1].replace(/,/g, ''));
        const change = parseInt(match[2]);

        if (isNaN(rawValue) || isNaN(change)) {
          throw new Error('Invalid metric values');
        }

        return {
          value: prefix + (rawValue >= 1000 ? `${(rawValue / 1000).toFixed(1)}K` : rawValue.toString()),
          change
        };
      };

      return [
        {
          metric: "Impressions",
          ...parseMetricValue(metrics.impressions),
          icon: Users
        },
        {
          metric: "Total Proceeds",
          ...parseMetricValue(metrics.proceeds, '$'),
          icon: DollarSign
        },
        {
          metric: "Page Views",
          ...parseMetricValue(metrics.pageViews),
          icon: Smartphone
        },
        {
          metric: "Crash Count",
          ...parseMetricValue(metrics.crashes),
          icon: Target
        }
      ];
    } catch (error) {
      console.error('Error parsing metrics:', error);
      toast({
        variant: "destructive",
        title: "Metrics Error",
        description: `Failed to parse metrics: ${error.message}`
      });
      return defaultData.performanceMetrics;
    }
  };

  const updateDashboardData = (data: any) => {
    try {
      const analysisText = data.openai_analysis;
      validateAnalysisText(analysisText);

      const appNameMatch = analysisText.match(/Report: ([^"]+)"/);
      if (appNameMatch && appNameMatch[1]) {
        setAppName(appNameMatch[1].trim());
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

      setAnalysisData(transformedData);
      
      toast({
        title: "Dashboard Updated",
        description: "Analysis data has been refreshed"
      });

      console.log('Successfully parsed dashboard data:', transformedData);
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast({
        variant: "destructive",
        title: "Dashboard Update Failed",
        description: error.message
      });
      setAnalysisData(defaultData);
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
