
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronDown, ChevronUp, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageContent } from "@/components/chat/MessageContent";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";

interface AnalysisResultCardProps {
  analysisResult: string | null;
  isLoading?: boolean;
  title?: string;
}

export function AnalysisResultCard({ analysisResult, isLoading = false, title = "Analysis Report" }: AnalysisResultCardProps) {
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

  return (
    <Card className="mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {extractedTitle}
        </h3>
        <div className="flex items-center gap-2">
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
    </Card>
  );
}
