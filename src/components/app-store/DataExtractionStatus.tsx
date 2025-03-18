
import { Check, AlertTriangle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataValidationWarnings } from "./DataValidationWarnings";

interface DataExtractionStatusProps {
  extractedData: any;
  showDetails?: boolean;
}

export function DataExtractionStatus({ extractedData, showDetails = false }: DataExtractionStatusProps) {
  // Return null if extractedData or necessary nested properties don't exist
  if (!extractedData || !extractedData.data || !extractedData.data.validation) {
    return null;
  }
  
  const { validation } = extractedData.data;
  const confidenceColor = getConfidenceColor(validation.confidence);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-800 bg-gray-900">
        <div className="flex-shrink-0">
          {validation.isValid ? (
            <Check className="h-5 w-5 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-white/90">
              {validation.isValid
                ? `Successfully extracted ${Object.keys(extractedData.data.metrics || {}).length} metric categories.`
                : `Partially processed. Missing data: ${validation.missingFields ? validation.missingFields.join(', ') : 'Some metrics'}`}
            </p>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">
                    {validation.isValid 
                      ? "All required metrics were successfully extracted"
                      : "Some required metrics could not be extracted from the input"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Confidence:</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${confidenceColor}`} 
                style={{ width: `${validation.confidence}%` }}
              ></div>
            </div>
            <span className={`text-xs ${confidenceColor}`}>{validation.confidence}%</span>
          </div>
        </div>
      </div>
      
      {/* Display validation warnings if available */}
      {showDetails && (
        <DataValidationWarnings validation={validation} showDetails={true} />
      )}
    </div>
  );
}

// Helper function to get color based on confidence score
function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-emerald-500 bg-emerald-500";
  if (confidence >= 60) return "text-amber-500 bg-amber-500";
  return "text-red-500 bg-red-500";
}
