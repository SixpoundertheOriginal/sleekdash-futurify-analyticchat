
import { LoadingOverlay } from "./LoadingOverlay";
import { AppStoreTabs } from "./tabs/AppStoreTabs";
import { AppStoreProvider } from "@/contexts/AppStoreContext";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";

interface AppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  return (
    <AppStoreProvider initialData={initialData}>
      <AppStoreAnalysisContent />
    </AppStoreProvider>
  );
}

function AppStoreAnalysisContent() {
  // The component now consumes the context directly
  const { isProcessing, isAnalyzing } = useAppStore();

  return (
    <div className="space-y-6 relative">
      {(isProcessing || isAnalyzing) && <LoadingOverlay />}
      <AppStoreTabs />
    </div>
  );
}

import { useAppStore } from "@/contexts/AppStoreContext";
