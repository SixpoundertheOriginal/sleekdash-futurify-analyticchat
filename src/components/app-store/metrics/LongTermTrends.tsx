
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface LongTermTrendsProps {
  data: ProcessedAnalytics;
  metric: "downloads" | "proceeds" | "retention" | "crashes";
}

export function LongTermTrends({ data, metric }: LongTermTrendsProps) {
  // Helper function to get the title based on the metric
  const getTitle = () => {
    switch(metric) {
      case "downloads": return "Download Trends";
      case "proceeds": return "Revenue Trends";
      case "retention": return "Retention Trends";
      case "crashes": return "Crash Rate Trends";
      default: return "Long-term Trends";
    }
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">{getTitle()}</h3>
      <div className="h-[250px] flex items-center justify-center text-white/60">
        <TrendingUp className="h-6 w-6 mr-2" />
        Long-term trend analysis for {metric} would appear here
      </div>
    </Card>
  );
}
