
import { Check, AlertTriangle, HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataValidationWarnings } from "./DataValidationWarnings";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";

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
  const extractedMetrics = getExtractedMetricsCount(extractedData.data.metrics);
  const missingMetrics = getMissingMetricsInfo(extractedData.data.metrics);
  
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
            
            <InteractiveTooltip
              content={
                <div className="space-y-2 max-w-xs">
                  <p className="text-sm font-medium">Extraction Details</p>
                  <div className="text-xs space-y-1 text-white/80">
                    <p><span className="text-emerald-400">✓</span> {extractedMetrics.total} metrics extracted</p>
                    {missingMetrics.count > 0 && (
                      <p><span className="text-amber-400">⚠</span> {missingMetrics.count} metrics missing</p>
                    )}
                    <div className="pt-1 border-t border-white/10 mt-1">
                      <p className="font-medium mb-1">Expected Format Tips:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Include numeric values for each metric</li>
                        <li>Format with clear labels (e.g., "Downloads: 10,000")</li>
                        <li>Include % changes when available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              }
            >
              <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </InteractiveTooltip>
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
          
          {extractedMetrics.total > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {extractedMetrics.categories.map((category) => (
                <div key={category.name} className="text-xs bg-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>{category.name}</span>
                  <span className="text-white/60">{category.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Display validation warnings if available */}
      {showDetails && (
        <DataValidationWarnings validation={validation} showDetails={true} />
      )}
      
      {/* Display missing metrics with format suggestions */}
      {missingMetrics.count > 0 && showDetails && (
        <div className="text-sm p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
          <div className="flex items-center gap-2 text-amber-400 font-medium mb-2">
            <Info className="h-4 w-4" />
            <span>Missing Metrics Format Guide</span>
          </div>
          <ul className="space-y-1 text-sm text-white/70">
            {missingMetrics.items.map((metric, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-400 text-xs font-mono mt-0.5">→</span>
                <span>{metric.label}: <span className="text-white/40 italic text-xs">{metric.example}</span></span>
              </li>
            ))}
          </ul>
        </div>
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

// Helper function to count extracted metrics by category
function getExtractedMetricsCount(metrics: any) {
  if (!metrics) return { total: 0, categories: [] };
  
  const categories = [];
  let total = 0;
  
  if (metrics.acquisitionMetrics) {
    const count = Object.values(metrics.acquisitionMetrics).filter(v => v !== null && v !== undefined && v !== 0).length;
    if (count > 0) {
      categories.push({ name: 'Acquisition', count });
      total += count;
    }
  }
  
  if (metrics.financialMetrics) {
    const count = Object.values(metrics.financialMetrics).filter(v => v !== null && v !== undefined && v !== 0).length;
    if (count > 0) {
      categories.push({ name: 'Financial', count });
      total += count;
    }
  }
  
  if (metrics.engagementMetrics) {
    const count = Object.values(metrics.engagementMetrics).filter(v => v !== null && v !== undefined && v !== 0).length;
    if (count > 0) {
      categories.push({ name: 'Engagement', count });
      total += count;
    }
  }
  
  if (metrics.technicalMetrics) {
    const count = Object.values(metrics.technicalMetrics).filter(v => v !== null && v !== undefined && v !== 0).length;
    if (count > 0) {
      categories.push({ name: 'Technical', count });
      total += count;
    }
  }
  
  return { total, categories };
}

// Helper function to get missing metrics with format examples
function getMissingMetricsInfo(metrics: any) {
  const missingMetrics = [];
  
  // Common expected metrics with example formats
  const expectedMetrics = [
    { path: 'acquisitionMetrics.downloads', label: 'Downloads', example: 'Downloads: 12,500 (+5% week-over-week)' },
    { path: 'acquisitionMetrics.impressions', label: 'Impressions', example: 'Product Page Views: 50K' },
    { path: 'acquisitionMetrics.conversionRate', label: 'Conversion Rate', example: 'Conversion Rate: 3.2% (-0.4% week-over-week)' },
    { path: 'financialMetrics.proceeds', label: 'Revenue', example: 'Total Proceeds: $15,200' },
    { path: 'engagementMetrics.sessionsPerDevice', label: 'Sessions Per Device', example: 'Average Sessions Per Device: 4.3' },
    { path: 'technicalMetrics.crashes', label: 'Crashes', example: 'Total Crashes: 48 (-12% from last period)' }
  ];
  
  // Check each expected metric
  for (const metric of expectedMetrics) {
    const parts = metric.path.split('.');
    const category = parts[0];
    const name = parts[1];
    
    if (!metrics || !metrics[category] || !metrics[category][name]) {
      missingMetrics.push(metric);
    }
  }
  
  return { count: missingMetrics.length, items: missingMetrics };
}
