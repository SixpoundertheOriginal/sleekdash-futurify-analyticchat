
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronDown, ChevronUp, Download, Share2, BarChart, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageContent } from "@/components/chat/MessageContent";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { DateRange } from "@/components/chat/DateRangePicker";

export interface AnalysisResultCardProps {
  analysisResult: string | null;
  isLoading?: boolean;
  isAnalyzing?: boolean;
  dateRange?: DateRange | null;
  title?: string;
  onViewDashboard?: () => void;
  extractionQuality?: 'high' | 'medium' | 'low';
}

export function AnalysisResultCard({ 
  analysisResult, 
  isLoading = false,
  isAnalyzing = false,
  dateRange,
  title = "Analysis Report",
  onViewDashboard,
  extractionQuality = 'medium' 
}: AnalysisResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleExportAnalysis = () => {
    if (!analysisResult) return;
    
    // Create a blob with the analysis text
    const blob = new Blob([analysisResult], { type: "text/plain;charset=utf-8" });
    
    // Generate a filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `app-store-analysis-${date}.txt`;
    
    // Save the file
    saveAs(blob, filename);
  };
  
  if (isLoading) {
    return (
      <Card className="p-5 mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          </motion.div>
          <p className="text-white/80 font-display">Processing analysis...</p>
          <p className="text-white/50 text-sm mt-1">Extracting insights from your data</p>
        </div>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card className="p-5 mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="text-center py-8">
          <Sparkles className="h-8 w-8 text-primary/40 mx-auto mb-2" />
          <p className="text-white/60">Submit your app data for analysis to see results here.</p>
          <p className="text-white/40 text-sm mt-2">Upload your App Store data to get AI-powered insights</p>
        </div>
      </Card>
    );
  }

  // Extract a title from the analysis if one exists
  const extractedTitle = analysisResult.match(/^#\s+(.*?)(?:\n|$)/m)?.[1] || title;
  
  // Get quality indicator styles
  const getQualityIndicator = () => {
    switch (extractionQuality) {
      case 'high':
        return { 
          color: 'text-emerald-500', 
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          icon: <Sparkles className="h-3.5 w-3.5" />,
          text: 'High-quality analysis'
        };
      case 'low':
        return { 
          color: 'text-amber-500', 
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          text: 'Limited analysis (improve data quality)'
        };
      default:
        return { 
          color: 'text-blue-500', 
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          icon: <Info className="h-3.5 w-3.5" />,
          text: 'Standard analysis'
        };
    }
  };
  
  const qualityIndicator = getQualityIndicator();

  return (
    <Card className="mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {extractedTitle}
        </h3>
        <div className="flex items-center gap-2">
          {onViewDashboard && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onViewDashboard}
              className="text-white/70 hover:text-primary hover:bg-white/5 transition-colors rounded-full gap-1.5"
              title="View Dashboard"
            >
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleExportAnalysis}
            className="text-white/70 hover:text-primary hover:bg-white/5 transition-colors rounded-full"
            title="Export Analysis"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/70 hover:text-primary hover:bg-white/5 transition-colors rounded-full"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      <div className={`px-4 py-2 flex items-center gap-2 text-xs ${qualityIndicator.bg} ${qualityIndicator.color} border-b ${qualityIndicator.border}`}>
        {qualityIndicator.icon}
        <span>{qualityIndicator.text}</span>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-invert max-w-none p-5"
          >
            <MessageContent content={analysisResult} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isExpanded && (
        <div 
          className="p-3 text-center text-white/60 text-sm cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-center gap-2" 
          onClick={() => setIsExpanded(true)}
        >
          <ChevronDown className="h-4 w-4 text-primary/70" />
          <span>Expand analysis to view insights</span>
        </div>
      )}
      
      {!isExpanded && onViewDashboard && (
        <div className="flex justify-center p-3 border-t border-white/5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDashboard}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
          >
            <BarChart className="h-4 w-4" />
            View Dashboard
          </Button>
        </div>
      )}
      
      {extractionQuality === 'low' && (
        <div className="p-3 border-t border-white/10 bg-amber-500/10">
          <p className="text-xs text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Analysis quality could be improved with more complete data</span>
          </p>
        </div>
      )}
    </Card>
  );
}
