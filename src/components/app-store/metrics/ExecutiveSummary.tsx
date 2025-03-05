
import { Card } from "@/components/ui/card";
import { AlertCircle, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface ExecutiveSummaryProps {
  title: string;
  summary: string;
  dateRange: string;
  data: ProcessedAnalytics;
}

export function ExecutiveSummary({ title, summary, dateRange, data }: ExecutiveSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
  
  useEffect(() => {
    // Check if we have a real summary
    setHasSummary(!!summary && summary.length > 10);
  }, [summary]);
  
  // Determine overall trend direction from metrics
  // Make sure to handle cases where metrics might be 0
  const metrics = [
    data?.acquisition?.downloads?.change || 0,
    data?.financial?.proceeds?.change || 0,
    data?.acquisition?.pageViews?.change || 0,
    data?.acquisition?.impressions?.change || 0
  ];
  
  const validMetricsCount = metrics.filter(m => m !== 0).length;
  const averageChange = validMetricsCount > 0 
    ? metrics.reduce((sum, val) => sum + val, 0) / validMetricsCount 
    : 0;
  const isPositive = averageChange > 0;

  // Check if all metrics are zero, which indicates potentially missing data
  const hasNoData = validMetricsCount === 0;
  
  // Generate automatic summary if none provided
  const autoSummary = hasNoData 
    ? `No performance data available for this period. Please analyze your app data to see insights.`
    : `During this period, your app ${isPositive ? 'showed positive growth' : 'faced some challenges'}. 
      ${data?.acquisition?.downloads?.value ? `Downloads ${data.acquisition.downloads.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(data.acquisition.downloads.change)}%` : ''}
      ${data?.financial?.proceeds?.value && data?.acquisition?.downloads?.value ? ' and ' : ''}
      ${data?.financial?.proceeds?.value ? `revenue ${data.financial.proceeds.change > 0 ? 'grew' : 'declined'} by ${Math.abs(data.financial.proceeds.change)}%` : ''}.
      ${data?.technical?.crashes?.value && data?.technical?.crashes?.change > 50 ? `There was a significant increase in crashes (${data.technical.crashes.change}%) which may require attention.` : ''}`;
      
  // Use the provided summary or auto-generated one
  const displaySummary = hasSummary ? summary : autoSummary;
  
  return (
    <Card className={`p-5 border ${
      hasNoData 
        ? 'border-white/20 bg-white/5' 
        : (isPositive 
          ? 'border-emerald-500/20 bg-emerald-500/5' 
          : 'border-amber-500/20 bg-amber-500/5')
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            hasNoData
              ? 'bg-white/10 text-white/70'
              : (isPositive
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-amber-500/20 text-amber-500')
          }`}>
            {hasNoData 
              ? <AlertCircle className="h-5 w-5" /> 
              : (isPositive ? <ChevronUp className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />)
            }
          </div>
          
          <div>
            <h3 className="font-display font-medium text-white/90">Performance Summary</h3>
            <p className="font-mono text-sm text-white/60 tabular-nums">{dateRange}</p>
            
            <div className={`mt-2 ${expanded ? '' : 'line-clamp-2'}`}>
              {displaySummary}
            </div>
            
            {displaySummary && displaySummary.length > 120 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpanded(!expanded)}
                className="mt-1 h-6 px-2 text-primary font-display"
              >
                {expanded ? 'Show less' : 'Read more'}
                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="text-white/70">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
