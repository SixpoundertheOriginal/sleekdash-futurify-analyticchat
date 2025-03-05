
import { Button } from "@/components/ui/button";
import { BarChart, Loader2, FileText } from "lucide-react";

interface FormButtonsProps {
  isProcessing: boolean;
  isAnalyzing: boolean;
  appDescription: string;
  onProcessClick: () => void;
  onAnalyzeClick: () => void;
}

export function FormButtons({
  isProcessing,
  isAnalyzing,
  appDescription,
  onProcessClick,
  onAnalyzeClick
}: FormButtonsProps) {
  const hasContent = Boolean(appDescription.trim());
  const isDisabled = isProcessing || isAnalyzing || !hasContent;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        onClick={onProcessClick}
        disabled={isDisabled}
        className="flex-1 bg-primary/90 hover:bg-primary text-white transition-colors duration-200 rounded-lg shadow-lg hover:shadow-primary/20"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing data...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Process & Analyze</span>
          </div>
        )}
      </Button>
      
      <Button 
        onClick={onAnalyzeClick}
        disabled={isDisabled}
        className="flex-1 bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 rounded-lg"
        variant="outline"
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Analyze Only</span>
          </div>
        )}
      </Button>
    </div>
  );
}
