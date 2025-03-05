
import { Check, AlertTriangle } from "lucide-react";

interface DataExtractionStatusProps {
  extractedData: any;
}

export function DataExtractionStatus({ extractedData }: DataExtractionStatusProps) {
  // Return null if extractedData or necessary nested properties don't exist
  if (!extractedData || !extractedData.data || !extractedData.data.validation) {
    return null;
  }
  
  const { validation } = extractedData.data;
  
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <div className="flex-shrink-0">
        {validation.isValid ? (
          <Check className="h-5 w-5 text-emerald-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        )}
      </div>
      <div>
        <p className="text-sm text-white/90">
          {validation.isValid
            ? `Successfully extracted ${Object.keys(extractedData.data.metrics).length} metric categories with ${validation.confidence}% confidence.`
            : `Partially processed. Missing data: ${validation.missingFields.join(', ')}`}
        </p>
      </div>
    </div>
  );
}
