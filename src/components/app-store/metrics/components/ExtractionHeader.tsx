
import { Card } from "@/components/ui/card";

interface ExtractionHeaderProps {
  confidence: number;
  extractionSource: "analysis" | "direct" | "manual";
}

export function ExtractionHeader({ confidence, extractionSource }: ExtractionHeaderProps) {
  const confidenceColor = confidence < 30 ? "text-red-500" : confidence < 70 ? "text-amber-500" : "text-green-500";
  
  return (
    <Card className="p-4 bg-white/5 border-white/10">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-1">Metrics Extraction</h3>
          <p className="text-sm text-white/60">
            Review and adjust metrics before visualization
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span>Extraction Confidence:</span>
            <span className={`font-semibold ${confidenceColor}`}>{confidence.toFixed(0)}%</span>
          </div>
          <div className="text-xs text-white/60">
            Source: {extractionSource === "analysis" ? "AI Analysis" : 
                    extractionSource === "direct" ? "Direct Extraction" : "Manual Edits"}
          </div>
        </div>
      </div>
    </Card>
  );
}
