
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface CompetitiveAnalysisProps {
  data: ProcessedAnalytics;
}

export function CompetitiveAnalysis({ data }: CompetitiveAnalysisProps) {
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-display font-semibold text-white mb-4">Competitive Analysis</h3>
      <div className="h-[250px] flex items-center justify-center text-white/60 font-mono">
        <BarChart3 className="h-6 w-6 mr-2" />
        Comparative market position analysis would appear here
      </div>
    </Card>
  );
}
