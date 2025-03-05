
import { Card } from "@/components/ui/card";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { ContextualHelp } from "@/components/ui/contextual-help";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendAnalysis } from "@/components/analytics/TrendAnalysis";

interface CompetitiveAnalysisProps {
  data: ProcessedAnalytics;
}

export function CompetitiveAnalysis({ data }: CompetitiveAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="p-8 bg-white/5 border-white/10 shadow-sm backdrop-blur-sm hover:border-white/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-white">Competitive Analysis</h3>
          <div className="flex items-center gap-3">
            <ContextualHelp
              content={
                <div className="space-y-2 max-w-xs">
                  <p>Compare your app's performance against similar apps in your category.</p>
                  <p className="text-xs text-white/70">Data is refreshed weekly based on App Store rankings.</p>
                </div>
              }
              position="top"
              size="sm"
            />
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary/60 hover:text-primary transition-colors duration-200 rounded-full p-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence>
          {!isExpanded ? (
            <motion.div 
              className="h-[280px] flex items-center justify-center text-white/60 font-mono rounded-lg border border-white/5 bg-black/20 backdrop-blur-md hover:bg-black/30 transition-all duration-300 cursor-pointer"
              onClick={() => setIsExpanded(true)}
              whileHover={{ 
                boxShadow: "0 0 16px rgba(139, 92, 246, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.15)"
              }}
              initial={{ opacity: 1, height: "280px" }}
              exit={{ opacity: 0, height: 0 }}
              key="collapsed-view"
            >
              <div className="flex flex-col items-center gap-4">
                <BarChart3 className="h-8 w-8 text-primary/60" />
                <p className="max-w-xs text-center text-sm">
                  Click to view comparative market position analysis
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-view"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <TrendAnalysis data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
