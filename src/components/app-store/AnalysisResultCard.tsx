
import { Card } from "@/components/ui/card";

interface AnalysisResultCardProps {
  analysisResult: string | null;
}

export function AnalysisResultCard({ analysisResult }: AnalysisResultCardProps) {
  if (!analysisResult) return null;

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
