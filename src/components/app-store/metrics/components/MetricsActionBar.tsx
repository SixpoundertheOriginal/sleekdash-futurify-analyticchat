
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, ArrowRight } from "lucide-react";

interface MetricsActionBarProps {
  resetToAnalysisMetrics: () => void;
  useDirectExtraction: () => void;
  applyChanges: () => void;
  goToDashboard: () => void;
  hasDirectExtraction: boolean;
}

export function MetricsActionBar({
  resetToAnalysisMetrics,
  useDirectExtraction,
  applyChanges,
  goToDashboard,
  hasDirectExtraction
}: MetricsActionBarProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-between mt-6">
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetToAnalysisMetrics}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Analysis
        </Button>
        
        {hasDirectExtraction && (
          <Button
            variant="outline"
            size="sm"
            onClick={useDirectExtraction}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Use Direct Extraction
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={applyChanges}
        >
          Apply Changes
        </Button>
        
        <Button 
          onClick={goToDashboard}
          className="flex items-center gap-2"
        >
          View Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
