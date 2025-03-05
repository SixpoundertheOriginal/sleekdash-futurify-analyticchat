
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AnalysisResultCardProps {
  analysisResult: string | null;
  isLoading?: boolean;
}

export function AnalysisResultCard({ analysisResult, isLoading = false }: AnalysisResultCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-white/80">Processing analysis...</p>
        </div>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card className="p-5 mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="text-center py-8">
          <p className="text-white/60">Submit your app data for analysis to see results here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
        Analysis Report
      </h3>
      <div className="prose prose-invert max-w-none">
        <div className="text-white/90 whitespace-pre-wrap leading-relaxed">{analysisResult}</div>
      </div>
    </Card>
  );
}
