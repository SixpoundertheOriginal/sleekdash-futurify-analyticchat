
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { ContextualHelp } from "@/components/ui/contextual-help";

interface CompetitiveAnalysisProps {
  data: ProcessedAnalytics;
}

export function CompetitiveAnalysis({ data }: CompetitiveAnalysisProps) {
  return (
    <Card className="p-8 bg-white/5 border-white/10 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-white">Competitive Analysis</h3>
        <ContextualHelp
          content={
            <div className="space-y-2 max-w-xs">
              <p>Compare your app's performance against similar apps in your category.</p>
              <p className="text-xs text-white/70">Data is refreshed weekly based on App Store rankings.</p>
            </div>
          }
          position="top"
          size="sm"
        />
      </div>
      <div className="h-[280px] flex items-center justify-center text-white/60 font-mono rounded-lg border border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <BarChart3 className="h-8 w-8 text-primary/60" />
          <p className="max-w-xs text-center text-sm">
            Comparative market position analysis would appear here
          </p>
        </div>
      </div>
    </Card>
  );
}
