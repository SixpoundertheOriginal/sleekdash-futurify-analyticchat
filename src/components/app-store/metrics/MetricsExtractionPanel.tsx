
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/contexts/AppStoreContext";
import { useMetricsExtraction } from "@/hooks/app-store/useMetricsExtraction";

// Import refactored components
import { NoMetricsAvailable } from "./components/NoMetricsAvailable";
import { ExtractionHeader } from "./components/ExtractionHeader";
import { MetricsActionBar } from "./components/MetricsActionBar";
import { AcquisitionMetricsTab } from "./tabs/AcquisitionMetricsTab";
import { FinancialMetricsTab } from "./tabs/FinancialMetricsTab";
import { EngagementMetricsTab } from "./tabs/EngagementMetricsTab";
import { TechnicalMetricsTab } from "./tabs/TechnicalMetricsTab";

export function MetricsExtractionPanel() {
  const { 
    processedAnalytics, 
    setProcessedAnalytics,
    setActiveTab,
    directlyExtractedMetrics
  } = useAppStore();
  
  const {
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
  } = useMetricsExtraction({
    processedAnalytics,
    directlyExtractedMetrics,
    setProcessedAnalytics,
    setActiveTab
  });
  
  if (!editableMetrics) {
    return <NoMetricsAvailable onGoToAnalysis={() => setActiveTab("analysis")} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Extraction info and confidence */}
      <ExtractionHeader 
        confidence={confidence} 
        extractionSource={extractionSource} 
      />
      
      {/* Metric editing tabs */}
      <Tabs value={activeMetricTab} onValueChange={setActiveMetricTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>
        
        <TabsContent value="acquisition">
          <AcquisitionMetricsTab 
            acquisitionMetrics={editableMetrics.acquisition}
            handleMetricChange={handleMetricChange}
          />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialMetricsTab 
            financialMetrics={editableMetrics.financial}
            handleMetricChange={handleMetricChange}
          />
        </TabsContent>
        
        <TabsContent value="engagement">
          <EngagementMetricsTab 
            engagementMetrics={editableMetrics.engagement}
            handleMetricChange={handleMetricChange}
          />
        </TabsContent>
        
        <TabsContent value="technical">
          <TechnicalMetricsTab 
            technicalMetrics={editableMetrics.technical}
            handleMetricChange={handleMetricChange}
          />
        </TabsContent>
      </Tabs>
      
      {/* Action buttons */}
      <MetricsActionBar 
        resetToAnalysisMetrics={resetToAnalysisMetrics}
        useDirectExtraction={useDirectExtraction}
        applyChanges={applyChanges}
        goToDashboard={goToDashboard}
        hasDirectExtraction={!!directlyExtractedMetrics}
      />
    </div>
  );
}
