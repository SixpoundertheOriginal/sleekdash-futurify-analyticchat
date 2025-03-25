
import { useEffect, useRef } from 'react';
import { useAppStore as useContext } from '@/contexts/AppStoreContext';
import { useAppStore } from '@/store';

/**
 * A debug hook that compares context and Zustand store values
 * and logs any differences. Useful during the migration process.
 */
export function useStoreMigrationDebug() {
  const context = useContext();
  const store = useAppStore();
  const prevContext = useRef(context);
  const prevStore = useRef(store);
  
  useEffect(() => {
    // Skip first render
    if (prevContext.current === context && prevStore.current === store) {
      return;
    }
    
    // Check for differences between context and store
    const differences: Record<string, { context: any, store: any }> = {};
    
    // List of keys to compare
    const keysToCompare = [
      'processedAnalytics',
      'directlyExtractedMetrics',
      'activeTab',
      'isProcessing',
      'isAnalyzing',
      'processingError',
      'extractedData',
      'analysisResult',
      'dateRange',
      'threadId',
      'assistantId'
    ];
    
    for (const key of keysToCompare) {
      // Skip functions
      if (typeof context[key] === 'function' || typeof store[key] === 'function') {
        continue;
      }
      
      // Compare values
      if (JSON.stringify(context[key]) !== JSON.stringify(store[key])) {
        differences[key] = {
          context: context[key],
          store: store[key]
        };
      }
    }
    
    // Log differences
    if (Object.keys(differences).length > 0) {
      console.group('Store Migration Debug: Differences detected');
      for (const [key, value] of Object.entries(differences)) {
        console.log(`Key: ${key}`);
        console.log('Context value:', value.context);
        console.log('Store value:', value.store);
        console.log('---');
      }
      console.groupEnd();
    }
    
    // Update refs
    prevContext.current = context;
    prevStore.current = store;
  }, [context, store]);
}
