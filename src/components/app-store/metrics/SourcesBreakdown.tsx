
import { Card } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface SourcesBreakdownProps {
  data: ProcessedAnalytics;
}

export function SourcesBreakdown({ data }: SourcesBreakdownProps) {
  // Extract source data if available
  const sources = data.geographical?.sources || [
    { source: "App Store Search", percentage: 88.6, downloads: 2994 },
    { source: "App Store Browse", percentage: 6.2, downloads: 210 },
    { source: "Institutional Purchase", percentage: 3.0, downloads: 100 },
    { source: "Unavailable", percentage: 1.2, downloads: 41 },
    { source: "App Referrer", percentage: 0.9, downloads: 29 }
  ];

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4">Download Sources</h3>
      <div className="h-[250px] flex items-center justify-center text-white/60">
        <PieChart className="h-6 w-6 mr-2" />
        Sources breakdown visualization would appear here
      </div>
      <div className="mt-4 space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-white/70">{source.source}</span>
            <span className="text-white">{source.percentage}% ({source.downloads})</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
