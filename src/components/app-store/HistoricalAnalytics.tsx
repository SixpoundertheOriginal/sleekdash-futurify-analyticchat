
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHistoricalAnalytics } from "@/utils/message-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function HistoricalAnalyticsBase() {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    let isMounted = true;
    
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const data = await getHistoricalAnalytics(10);
        if (data && isMounted) {
          setHistoricalData(data);
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistoricalData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize chart data to prevent recalculation on each render
  const chartData = useMemo(() => {
    return historicalData.map(item => ({
      date: item.formattedDate,
      impressions: item.impressions,
      pageViews: item.pageViews,
      downloads: item.downloads,
      proceeds: item.proceeds
    })).reverse(); // Reverse to show oldest to newest
  }, [historicalData]);

  // Loading skeleton
  const LoadingSkeleton = useCallback(() => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  ), []);

  // Empty state
  const EmptyState = useCallback(() => (
    <p className="text-center text-muted-foreground py-8">
      No historical data available yet. Submit analytics data to start tracking.
    </p>
  ), []);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Historical Analytics</CardTitle>
        <CardDescription>
          Track your app's performance over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : historicalData.length === 0 ? (
          <EmptyState />
        ) : (
          <Tabs defaultValue="trends">
            <TabsList className="mb-4">
              <TabsTrigger value="trends">Performance Trends</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                    <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="downloads" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="downloads">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="downloads" stroke="#ffc658" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="revenue">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="proceeds" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const HistoricalAnalytics = memo(HistoricalAnalyticsBase);
