
import { useEffect, ReactNode } from 'react';
import { useAppStore as useContext } from '@/contexts/AppStoreContext';
import { useAppStore } from '@/store';

interface AppStoreContextBridgeProps {
  children: ReactNode;
}

/**
 * This component bridges the AppStoreContext with the Zustand store
 * during the migration phase. It syncs context values to the Zustand store.
 */
export function AppStoreContextBridge({ children }: AppStoreContextBridgeProps) {
  const context = useContext();
  const store = useAppStore();
  
  // Sync values from context to Zustand store
  useEffect(() => {
    store.setProcessedAnalytics(context.processedAnalytics);
    store.setDirectlyExtractedMetrics(context.directlyExtractedMetrics);
    store.setDateRange(context.dateRange);
    store.setActiveTab(context.activeTab);
    store.setProcessing(context.isProcessing);
    store.setAnalyzing(context.isAnalyzing);
    store.setProcessingError(context.processingError);
    store.setExtractedData(context.extractedData);
    store.setAnalysisResult(context.analysisResult);
    
    // Thread info might come from a different context
    if (context.threadId) {
      store.setThreadId(context.threadId);
    }
    if (context.assistantId) {
      store.setAssistantId(context.assistantId);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    context.processedAnalytics,
    context.directlyExtractedMetrics,
    context.dateRange,
    context.activeTab,
    context.isProcessing,
    context.isAnalyzing,
    context.processingError,
    context.extractedData,
    context.analysisResult,
    context.threadId,
    context.assistantId
  ]);
  
  return <>{children}</>;
}
