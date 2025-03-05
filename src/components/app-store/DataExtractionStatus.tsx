
import { Check, AlertTriangle } from "lucide-react";

interface DataExtractionStatusProps {
  extractedData: any;
}

export function DataExtractionStatus({ extractedData }: DataExtractionStatusProps) {
  if (!extractedData) return null;
  
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <div className="flex-shrink-0">
        {extractedData.data.validation.isValid ? (
          <Check className="h-5 w-5 text-emerald-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        )}
      </div>
      <div>
        <p className="text-sm text-white/90">
          {extractedData.data.validation.isValid
            ? `Successfully extracted ${Object.keys(extractedData.data.metrics).length} metric categories with ${extractedData.data.validation.confidence}% confidence.`
            : `Partially processed. Missing data: ${extractedData.data.validation.missingFields.join(', ')}`}
        </p>
      </div>
    </div>
  );
}
