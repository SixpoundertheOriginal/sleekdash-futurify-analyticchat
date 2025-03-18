
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAppStore } from "@/contexts/AppStoreContext";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { normalizeValue } from "@/utils/analytics/metricTypes";
import { ArrowRight, AlertTriangle, Check, BarChart, RefreshCw } from "lucide-react";
import { formatValue, formatCurrency, formatPercentage } from "@/utils/analytics/formatters";

export function MetricsExtractionPanel() {
  const { 
    analysisResult, 
    processedAnalytics, 
    setProcessedAnalytics,
    setActiveTab,
    directlyExtractedMetrics
  } = useAppStore();
  
  const { toast } = useToast();
  const [editableMetrics, setEditableMetrics] = useState<ProcessedAnalytics | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState("acquisition");
  const [extractionSource, setExtractionSource] = useState<"analysis" | "direct" | "manual">("analysis");
  
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
  
  // Initialize editable metrics when processed analytics change
  useEffect(() => {
    if (processedAnalytics) {
      setEditableMetrics(JSON.parse(JSON.stringify(processedAnalytics)));
    }
  }, [processedAnalytics]);
  
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
  
  if (!editableMetrics) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="text-center text-white/60">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold mb-2">No Metrics Available</h3>
          <p>Please process your data in the Analysis tab first.</p>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab("analysis")} 
            className="mt-4"
          >
            Go to Analysis
          </Button>
        </div>
      </Card>
    );
  }
  
  const confidence = calculateExtractionConfidence(editableMetrics);
  const confidenceColor = confidence < 30 ? "text-red-500" : confidence < 70 ? "text-amber-500" : "text-green-500";
  
  return (
    <div className="space-y-6">
      {/* Extraction info and confidence */}
      <Card className="p-4 bg-white/5 border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-1">Metrics Extraction</h3>
            <p className="text-sm text-white/60">
              Review and adjust metrics before visualization
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span>Extraction Confidence:</span>
              <span className={`font-semibold ${confidenceColor}`}>{confidence.toFixed(0)}%</span>
            </div>
            <div className="text-xs text-white/60">
              Source: {extractionSource === "analysis" ? "AI Analysis" : 
                      extractionSource === "direct" ? "Direct Extraction" : "Manual Edits"}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Metric editing tabs */}
      <Tabs value={activeMetricTab} onValueChange={setActiveMetricTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>
        
        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricInput
              label="Downloads"
              value={editableMetrics.acquisition.downloads.value.toString()}
              onChange={(value) => handleMetricChange("acquisition", "downloads", "value", value)}
              changeValue={editableMetrics.acquisition.downloads.change}
              onChangeValueUpdate={(value) => handleMetricChange("acquisition", "downloads", "change", value)}
              formatter={formatValue}
            />
            <MetricInput
              label="Impressions"
              value={editableMetrics.acquisition.impressions.value.toString()}
              onChange={(value) => handleMetricChange("acquisition", "impressions", "value", value)}
              changeValue={editableMetrics.acquisition.impressions.change}
              onChangeValueUpdate={(value) => handleMetricChange("acquisition", "impressions", "change", value)}
              formatter={formatValue}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricInput
              label="Page Views"
              value={editableMetrics.acquisition.pageViews.value.toString()}
              onChange={(value) => handleMetricChange("acquisition", "pageViews", "value", value)}
              changeValue={editableMetrics.acquisition.pageViews.change}
              onChangeValueUpdate={(value) => handleMetricChange("acquisition", "pageViews", "change", value)}
              formatter={formatValue}
            />
            <MetricInput
              label="Conversion Rate (%)"
              value={editableMetrics.acquisition.conversionRate.value.toString()}
              onChange={(value) => handleMetricChange("acquisition", "conversionRate", "value", value)}
              changeValue={editableMetrics.acquisition.conversionRate.change}
              onChangeValueUpdate={(value) => handleMetricChange("acquisition", "conversionRate", "change", value)}
              formatter={formatPercentage}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricInput
              label="Total Proceeds"
              value={editableMetrics.financial.proceeds.value.toString()}
              onChange={(value) => handleMetricChange("financial", "proceeds", "value", value)}
              changeValue={editableMetrics.financial.proceeds.change}
              onChangeValueUpdate={(value) => handleMetricChange("financial", "proceeds", "change", value)}
              formatter={formatCurrency}
            />
            <MetricInput
              label="Proceeds Per User"
              value={editableMetrics.financial.proceedsPerUser.value.toString()}
              onChange={(value) => handleMetricChange("financial", "proceedsPerUser", "value", value)}
              changeValue={editableMetrics.financial.proceedsPerUser.change}
              onChangeValueUpdate={(value) => handleMetricChange("financial", "proceedsPerUser", "change", value)}
              formatter={formatCurrency}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricInput
              label="Sessions Per Device"
              value={editableMetrics.engagement.sessionsPerDevice.value.toString()}
              onChange={(value) => handleMetricChange("engagement", "sessionsPerDevice", "value", value)}
              changeValue={editableMetrics.engagement.sessionsPerDevice.change}
              onChangeValueUpdate={(value) => handleMetricChange("engagement", "sessionsPerDevice", "change", value)}
              formatter={formatValue}
            />
            <MetricInput
              label="Day 1 Retention (%)"
              value={editableMetrics.engagement.retention.day1.value.toString()}
              onChange={(value) => handleMetricChange("engagement", "retention", "day1", value)}
              benchmark={editableMetrics.engagement.retention.day1.benchmark}
              formatter={formatPercentage}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricInput
              label="Day 7 Retention (%)"
              value={editableMetrics.engagement.retention.day7.value.toString()}
              onChange={(value) => handleMetricChange("engagement", "retention", "day7", value)}
              benchmark={editableMetrics.engagement.retention.day7.benchmark}
              formatter={formatPercentage}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricInput
              label="Crashes"
              value={editableMetrics.technical.crashes.value.toString()}
              onChange={(value) => handleMetricChange("technical", "crashes", "value", value)}
              changeValue={editableMetrics.technical.crashes.change}
              onChangeValueUpdate={(value) => handleMetricChange("technical", "crashes", "change", value)}
              formatter={(val) => Math.round(val).toString()}
            />
            <MetricInput
              label="Crash Rate (%)"
              value={editableMetrics.technical.crashRate.value.toString()}
              onChange={(value) => handleMetricChange("technical", "crashRate", "value", value)}
              formatter={formatPercentage}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Action buttons */}
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
          
          {directlyExtractedMetrics && (
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
            Continue to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MetricInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  changeValue?: number;
  onChangeValueUpdate?: (value: string) => void;
  benchmark?: number;
  formatter?: (value: number) => string;
}

function MetricInput({ 
  label, 
  value, 
  onChange, 
  changeValue, 
  onChangeValueUpdate,
  benchmark,
  formatter = (val) => val.toString() 
}: MetricInputProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-white/60";
  };
  
  return (
    <div className="bg-white/5 p-3 rounded-md border border-white/10">
      <div className="flex justify-between items-start mb-2">
        <label className="text-sm font-medium">{label}</label>
        {benchmark !== undefined && (
          <div className="text-xs text-white/60">
            Benchmark: {formatter(benchmark)}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/10 border-white/20"
        />
        
        {changeValue !== undefined && onChangeValueUpdate && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Change %:</span>
            <Input 
              value={changeValue.toString()}
              onChange={(e) => onChangeValueUpdate(e.target.value)}
              className="bg-white/10 border-white/20 h-7 text-xs"
            />
            <span className={`text-xs ${getChangeColor(changeValue)}`}>
              {changeValue > 0 ? "+" : ""}{changeValue}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
