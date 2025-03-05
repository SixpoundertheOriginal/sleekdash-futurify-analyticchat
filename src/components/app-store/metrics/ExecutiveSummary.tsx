
import { Card } from "@/components/ui/card";
import { AlertCircle, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface ExecutiveSummaryProps {
  title: string;
  summary: string;
  dateRange: string;
  data: ProcessedAnalytics;
}

export function ExecutiveSummary({ title, summary, dateRange, data }: ExecutiveSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Determine overall trend direction from metrics
  const metrics = [
    data.acquisition.downloads.change,
    data.financial.proceeds.change,
    data.acquisition.pageViews.change,
    data.acquisition.impressions.change
  ];
  
  const averageChange = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
  const isPositive = averageChange > 0;
  
  return (
    <Card className={`p-5 border ${
      isPositive 
        ? 'border-emerald-500/20 bg-emerald-500/5' 
        : 'border-amber-500/20 bg-amber-500/5'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            isPositive
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'bg-amber-500/20 text-amber-500'
          }`}>
            {isPositive ? <ChevronUp className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          
          <div>
            <h3 className="font-medium text-white/90">Performance Summary</h3>
            <p className="text-sm text-white/60">{dateRange}</p>
            
            <div className={`mt-2 ${expanded ? '' : 'line-clamp-2'}`}>
              {summary || 
                `During this period, your app ${isPositive ? 'showed positive growth' : 'faced some challenges'}. 
                Downloads ${data.acquisition.downloads.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(data.acquisition.downloads.change)}% 
                and revenue ${data.financial.proceeds.change > 0 ? 'grew' : 'declined'} by ${Math.abs(data.financial.proceeds.change)}%.`
              }
            </div>
            
            {summary && summary.length > 120 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpanded(!expanded)}
                className="mt-1 h-6 px-2 text-primary"
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
