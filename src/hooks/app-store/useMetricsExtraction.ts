
import { useState, useEffect } from "react";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useToast } from "@/components/ui/use-toast";
import { normalizeValue } from "@/utils/analytics/metricTypes";

export function useMetricsExtraction({
  processedAnalytics,
  directlyExtractedMetrics,
  setProcessedAnalytics,
  setActiveTab
}: {
  processedAnalytics: ProcessedAnalytics | null;
  directlyExtractedMetrics: Partial<ProcessedAnalytics> | null;
  setProcessedAnalytics: (analytics: ProcessedAnalytics | null) => void;
  setActiveTab: (tab: string) => void;
}) {
  const { toast } = useToast();
  const [editableMetrics, setEditableMetrics] = useState<ProcessedAnalytics | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState("acquisition");
  const [extractionSource, setExtractionSource] = useState<"analysis" | "direct" | "manual">("analysis");
  
  // Initialize editable metrics when processed analytics change
  useEffect(() => {
    if (processedAnalytics) {
      setEditableMetrics(JSON.parse(JSON.stringify(processedAnalytics)));
    }
  }, [processedAnalytics]);
  
  // Calculate overall metrics extraction confidence
  const calculateExtractionConfidence = (metrics: ProcessedAnalytics | null): number => {
    if (!metrics) return 0;
    
    let totalMetrics = 0;
    let availableMetrics = 0;
    
    // Check acquisition metrics
    if (metrics.acquisition) {
      if (metrics.acquisition.downloads.value > 0) availableMetrics++;
      if (metrics.acquisition.impressions.value > 0) availableMetrics++;
      if (metrics.acquisition.pageViews.value > 0) availableMetrics++;
      if (metrics.acquisition.conversionRate.value > 0) availableMetrics++;
      totalMetrics += 4;
    }
    
    // Check financial metrics
    if (metrics.financial) {
      if (metrics.financial.proceeds.value > 0) availableMetrics++;
      if (metrics.financial.proceedsPerUser.value > 0) availableMetrics++;
      totalMetrics += 2;
    }
    
    // Check engagement metrics
    if (metrics.engagement) {
      if (metrics.engagement.sessionsPerDevice.value > 0) availableMetrics++;
      if (metrics.engagement.retention.day1.value > 0) availableMetrics++;
      totalMetrics += 2;
    }
    
    // Check technical metrics
    if (metrics.technical) {
      if (metrics.technical.crashes.value > 0) availableMetrics++;
      totalMetrics += 1;
    }
    
    return totalMetrics > 0 ? (availableMetrics / totalMetrics) * 100 : 0;
  };
  
  // Handle manual update of a metric
  const handleMetricChange = (
    category: keyof ProcessedAnalytics,
    metric: string,
    subMetric: string | null,
    value: string
  ) => {
    if (!editableMetrics) return;
    
    const numericValue = normalizeValue(value);
    if (isNaN(numericValue)) return;
    
    setEditableMetrics(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev };
      if (subMetric) {
        // For nested metrics like retention.day1.value
        (updated[category] as any)[metric][subMetric] = numericValue;
      } else {
        // For metrics with value property like downloads.value
        (updated[category] as any)[metric].value = numericValue;
      }
      
      setExtractionSource("manual");
      return updated;
    });
  };
  
  // Apply changes to the app store context
  const applyChanges = () => {
    if (editableMetrics) {
      setProcessedAnalytics(editableMetrics);
      
      toast({
        title: "Metrics Updated",
        description: "Your metrics have been updated and are ready for dashboard visualization.",
      });
    }
  };
  
  // Switch to dashboard tab after applying changes
  const goToDashboard = () => {
    applyChanges();
    setActiveTab("dashboard");
  };
  
  // Reset metrics to values from AI analysis
  const resetToAnalysisMetrics = () => {
    if (processedAnalytics) {
      setEditableMetrics(JSON.parse(JSON.stringify(processedAnalytics)));
      setExtractionSource("analysis");
      
      toast({
        title: "Metrics Reset",
        description: "Metrics have been reset to values extracted from AI analysis.",
      });
    }
  };
  
  // Use directly extracted metrics when available
  const useDirectExtraction = () => {
    if (directlyExtractedMetrics) {
      setEditableMetrics(prev => {
        if (!prev) return prev;
        
        const updated = { ...prev };
        // Merge direct extraction with existing metrics
        if (directlyExtractedMetrics.acquisition) {
          updated.acquisition = {
            ...updated.acquisition,
            ...directlyExtractedMetrics.acquisition
          };
        }
        
        if (directlyExtractedMetrics.financial) {
          updated.financial = {
            ...updated.financial,
            ...directlyExtractedMetrics.financial
          };
        }
        
        if (directlyExtractedMetrics.technical) {
          updated.technical = {
            ...updated.technical,
            ...directlyExtractedMetrics.technical
          };
        }
        
        if (directlyExtractedMetrics.engagement) {
          updated.engagement = {
            ...updated.engagement,
            ...directlyExtractedMetrics.engagement
          };
        }
        
        setExtractionSource("direct");
        return updated;
      });
      
      toast({
        title: "Direct Metrics Applied",
        description: "Metrics have been updated using direct extraction from input data.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "No Direct Metrics",
        description: "No directly extracted metrics are available.",
      });
    }
  };
  
  const confidence = calculateExtractionConfidence(editableMetrics);
  
  return {
    editableMetrics,
    activeMetricTab,
    setActiveMetricTab,
    extractionSource,
    confidence,
    handleMetricChange,
    applyChanges,
    goToDashboard,
    resetToAnalysisMetrics,
    useDirectExtraction
  };
}
