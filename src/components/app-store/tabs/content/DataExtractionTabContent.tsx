import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAppStore } from "@/contexts/AppStoreContext";
import { extractDirectMetrics } from "@/utils/analytics/offline/directExtraction";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { createDefaultProcessedAnalytics } from "@/hooks/app-store/appStoreAnalyticsUtils";
import { ArrowRight, AlertTriangle, Check, Database, RefreshCw, Beaker } from "lucide-react";

interface DataExtractionTabContentProps {
  setActiveTab: (tab: string) => void;
}

export function DataExtractionTabContent({ setActiveTab }: DataExtractionTabContentProps) {
  const { 
    extractedData, 
    processedAnalytics,
    setProcessedAnalytics,
    handleDirectExtractionSuccess,
    directlyExtractedMetrics,
    isProcessing
  } = useAppStore();
  
  const { toast } = useToast();
  const [extractedMetrics, setExtractedMetrics] = useState<Partial<ProcessedAnalytics> | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState("acquisition");
  const [extractionConfidence, setExtractionConfidence] = useState(0);

  useEffect(() => {
    if (extractedData) {
      extractMetricsFromText(extractedData);
    }
  }, [extractedData]);

  const calculateExtractionConfidence = (metrics: Partial<ProcessedAnalytics>): number => {
    if (!metrics) return 0;
    
    let totalFields = 0;
    let filledFields = 0;
    
    if (metrics.acquisition) {
      if (metrics.acquisition.downloads?.value > 0) filledFields++;
      if (metrics.acquisition.impressions?.value > 0) filledFields++;
      if (metrics.acquisition.pageViews?.value > 0) filledFields++;
      if (metrics.acquisition.conversionRate?.value > 0) filledFields++;
      totalFields += 4;
    }
    
    if (metrics.financial) {
      if (metrics.financial.proceeds?.value > 0) filledFields++;
      if (metrics.financial.proceedsPerUser?.value > 0) filledFields++;
      totalFields += 2;
    }
    
    if (metrics.engagement) {
      if (metrics.engagement.sessionsPerDevice?.value > 0) filledFields++;
      if (metrics.engagement.retention?.day1?.value > 0) filledFields++;
      totalFields += 2;
    }
    
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  };

  const extractMetricsFromText = (inputData: any) => {
    try {
      console.log("Attempting to extract metrics from input data:", typeof inputData);
      
      if (!inputData) {
        console.warn("No input data provided for extraction");
        toast({
          variant: "destructive",
          title: "Extraction Failed",
          description: "No data available for extraction."
        });
        return;
      }
      
      let textToExtract: string;
      if (typeof inputData === 'string') {
        textToExtract = inputData;
      } else if (inputData && typeof inputData === 'object') {
        if (inputData.rawContent) {
          textToExtract = inputData.rawContent;
        } else if (inputData.data && inputData.data.rawContent) {
          textToExtract = inputData.data.rawContent;
        } else if (inputData.text || inputData.content) {
          textToExtract = inputData.text || inputData.content;
        } else {
          textToExtract = JSON.stringify(inputData);
        }
      } else {
        textToExtract = String(inputData || '');
      }
      
      if (!textToExtract || textToExtract.trim().length === 0) {
        console.warn("Empty text content for extraction");
        toast({
          variant: "destructive",
          title: "Extraction Failed",
          description: "Input data is empty or in an unsupported format."
        });
        return;
      }
      
      console.log("Extracting from text content of length:", textToExtract.length);
      const metrics = extractDirectMetrics(textToExtract);
      setExtractedMetrics(metrics);
      
      const confidence = calculateExtractionConfidence(metrics);
      setExtractionConfidence(confidence);
      
      const filledCount = filledFieldsCount(metrics);
      console.log(`Extracted ${filledCount} fields with confidence ${confidence.toFixed(0)}%`);
      
      if (metrics && filledCount > 0) {
        toast({
          title: "Metrics Extracted",
          description: `Successfully extracted ${filledCount} metrics from your data.`
        });
      } else {
        toast({
          variant: "warning",
          title: "Limited Extraction",
          description: "Few or no metrics could be extracted. You may need to edit the data format or enter metrics manually."
        });
      }
    } catch (error) {
      console.error("Error extracting metrics:", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Could not extract metrics from the input data."
      });
    }
  };

  const filledFieldsCount = (metrics: Partial<ProcessedAnalytics>): number => {
    let count = 0;
    
    if (metrics.acquisition) {
      if (metrics.acquisition.downloads?.value > 0) count++;
      if (metrics.acquisition.impressions?.value > 0) count++;
      if (metrics.acquisition.pageViews?.value > 0) count++;
      if (metrics.acquisition.conversionRate?.value > 0) count++;
    }
    
    if (metrics.financial) {
      if (metrics.financial.proceeds?.value > 0) count++;
      if (metrics.financial.proceedsPerUser?.value > 0) count++;
    }
    
    if (metrics.engagement) {
      if (metrics.engagement.sessionsPerDevice?.value > 0) count++;
      if (metrics.engagement.retention?.day1?.value > 0) count++;
    }
    
    return count;
  };

  const applyExtractedMetrics = () => {
    if (extractedMetrics) {
      const baseMetrics = createDefaultProcessedAnalytics();
      const mergedMetrics = mergeWithDefaults(extractedMetrics, baseMetrics);
      
      setProcessedAnalytics(mergedMetrics);
      
      if (handleDirectExtractionSuccess) {
        handleDirectExtractionSuccess(mergedMetrics);
      }
      
      toast({
        title: "Metrics Applied",
        description: "Extracted metrics have been saved and are ready for analysis."
      });
    }
  };

  const mergeWithDefaults = (
    extracted: Partial<ProcessedAnalytics>, 
    defaults: ProcessedAnalytics
  ): ProcessedAnalytics => {
    const result = { ...defaults };
    
    if (extracted.acquisition) {
      result.acquisition = {
        ...result.acquisition,
        ...extracted.acquisition
      };
    }
    
    if (extracted.financial) {
      result.financial = {
        ...result.financial,
        ...extracted.financial
      };
    }
    
    if (extracted.engagement) {
      result.engagement = {
        ...result.engagement,
        ...extracted.engagement
      };
    }
    
    if (extracted.technical) {
      result.technical = {
        ...result.technical,
        ...extracted.technical
      };
    }
    
    if (extracted.summary) {
      result.summary = {
        ...result.summary,
        ...extracted.summary,
        executiveSummary: extracted.summary.executiveSummary || 
          "Metrics extracted directly from raw data."
      };
    }
    
    return result;
  };

  const continueToAnalysis = () => {
    applyExtractedMetrics();
    setActiveTab("analysis");
  };

  const goBackToInput = () => {
    setActiveTab("input");
  };

  if (!extractedData) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-semibold">No Data Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please enter your App Store data in the Input tab first before extracting metrics.
          </p>
          <Button onClick={goBackToInput}>Go to Input Tab</Button>
        </div>
      </Card>
    );
  }

  const confidenceColor = 
    extractionConfidence < 30 ? "text-red-500" : 
    extractionConfidence < 70 ? "text-amber-500" : 
    "text-green-500";

  return (
    <div className="space-y-6 p-4">
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Extraction
            </h3>
            <p className="text-sm text-muted-foreground">
              We've automatically extracted KPIs from your raw data.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span>Extraction Confidence:</span>
              <span className={`font-semibold ${confidenceColor}`}>{extractionConfidence.toFixed(0)}%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {filledFieldsCount(extractedMetrics || {})} metrics extracted
            </div>
          </div>
        </div>
      </Card>

      {extractedMetrics && (
        <div className="space-y-4">
          <Tabs value={activeMetricTab} onValueChange={setActiveMetricTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="acquisition" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExtractedMetricCard
                  label="Downloads"
                  value={extractedMetrics.acquisition?.downloads?.value}
                  change={extractedMetrics.acquisition?.downloads?.change}
                />
                <ExtractedMetricCard
                  label="Impressions"
                  value={extractedMetrics.acquisition?.impressions?.value}
                  change={extractedMetrics.acquisition?.impressions?.change}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExtractedMetricCard
                  label="Page Views"
                  value={extractedMetrics.acquisition?.pageViews?.value}
                  change={extractedMetrics.acquisition?.pageViews?.change}
                />
                <ExtractedMetricCard
                  label="Conversion Rate"
                  value={extractedMetrics.acquisition?.conversionRate?.value}
                  change={extractedMetrics.acquisition?.conversionRate?.change}
                  isPercentage
                />
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExtractedMetricCard
                  label="Total Proceeds"
                  value={extractedMetrics.financial?.proceeds?.value}
                  change={extractedMetrics.financial?.proceeds?.change}
                  isCurrency
                />
                <ExtractedMetricCard
                  label="Proceeds Per User"
                  value={extractedMetrics.financial?.proceedsPerUser?.value}
                  change={extractedMetrics.financial?.proceedsPerUser?.change}
                  isCurrency
                />
              </div>
            </TabsContent>
            
            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExtractedMetricCard
                  label="Sessions Per Device"
                  value={extractedMetrics.engagement?.sessionsPerDevice?.value}
                  change={extractedMetrics.engagement?.sessionsPerDevice?.change}
                />
                <ExtractedMetricCard
                  label="Day 1 Retention"
                  value={extractedMetrics.engagement?.retention?.day1?.value}
                  benchmark={extractedMetrics.engagement?.retention?.day1?.benchmark}
                  isPercentage
                />
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExtractedMetricCard
                  label="Crashes"
                  value={extractedMetrics.technical?.crashes?.value}
                  change={extractedMetrics.technical?.crashes?.change}
                />
                <ExtractedMetricCard
                  label="Crash Rate"
                  value={extractedMetrics.technical?.crashRate?.value}
                  isPercentage
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={goBackToInput}
              disabled={isProcessing}
            >
              Back to Input
            </Button>
            
            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={() => extractMetricsFromText(extractedData)}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Re-extract Metrics
              </Button>
              
              <Button
                onClick={continueToAnalysis}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                Continue to Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-md border border-slate-800 text-sm">
            <p className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Beaker className="h-4 w-4" />
              <span>What happens next?</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>These extracted metrics will be saved</li>
              <li>The AI analysis will be enhanced with this extraction</li>
              <li>You can further refine metrics in the Metrics tab later</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface ExtractedMetricCardProps {
  label: string;
  value?: number;
  change?: number;
  benchmark?: number;
  isPercentage?: boolean;
  isCurrency?: boolean;
}

function ExtractedMetricCard({ 
  label, 
  value, 
  change, 
  benchmark,
  isPercentage = false,
  isCurrency = false 
}: ExtractedMetricCardProps) {
  const formatValue = (val: number | undefined): string => {
    if (val === undefined || isNaN(Number(val))) return "Not extracted";
    
    if (isPercentage) {
      return `${val.toFixed(2)}%`;
    }
    
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(val);
    }
    
    return new Intl.NumberFormat('en-US').format(val);
  };
  
  const getChangeColor = (changeVal: number | undefined): string => {
    if (changeVal === undefined) return "text-muted-foreground";
    if (changeVal > 0) return "text-green-500";
    if (changeVal < 0) return "text-red-500";
    return "text-muted-foreground";
  };
  
  const isExtracted = value !== undefined && !isNaN(Number(value));
  
  return (
    <Card className={`p-4 border ${isExtracted ? "border-slate-700" : "border-slate-800 bg-slate-900/50"}`}>
      <div className="flex justify-between items-start">
        <div className="font-medium">{label}</div>
        {isExtracted ? (
          <div className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded-full flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Extracted
          </div>
        ) : (
          <div className="text-xs px-2 py-1 bg-amber-500/20 text-amber-500 rounded-full">
            Not Found
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        
        {change !== undefined && (
          <div className={`text-sm mt-1 ${getChangeColor(change)}`}>
            {change > 0 ? "+" : ""}{change}% vs previous period
          </div>
        )}
        
        {benchmark !== undefined && (
          <div className="text-sm mt-1 text-muted-foreground">
            Benchmark: {formatValue(benchmark)}
          </div>
        )}
      </div>
    </Card>
  );
}
