import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { KeyMetricsGrid } from "./analytics/KeyMetricsGrid";
import { ConversionFunnel } from "./analytics/ConversionFunnel";
import { GeographicalDistribution } from "./analytics/GeographicalDistribution";
import { RetentionChart } from "./analytics/RetentionChart";

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data, error, isProcessing } = useAnalysisData(`
    // ... paste the full analysis text here as a template
  `);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      toast({
        title: "Dashboard Updated",
        description: "Analysis data has been refreshed"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to refresh analysis data"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-500">Error loading dashboard data: {error}</p>
      </div>
    );
  }

  if (isProcessing || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">{data.summary.title}</h2>
          <p className="text-white/60">{data.summary.dateRange}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
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

      <KeyMetricsGrid data={data} />

      <div className="grid gap-6 md:grid-cols-2">
        <ConversionFunnel data={data} />
        <GeographicalDistribution data={data} />
        <RetentionChart data={data} />
      </div>
    </div>
  );
}
