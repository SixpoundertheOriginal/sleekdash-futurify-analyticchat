
import { LoadingOverlay } from "./LoadingOverlay";
import { AppStoreTabs } from "./tabs/AppStoreTabs";
import { AppStoreProvider } from "@/contexts/AppStoreContext";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAppStore } from "@/contexts/AppStoreContext";
import { AppStoreContextBridge } from "./AppStoreContextBridge";

interface AppStoreAnalysisProps {
  initialData?: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  return (
    <ErrorBoundary
      fallback={<AppAnalysisErrorFallback />}
    >
      <AppStoreProvider initialData={initialData}>
        {/* Bridge to sync context with Zustand store */}
        <AppStoreContextBridge>
          <AppStoreAnalysisContent />
        </AppStoreContextBridge>
      </AppStoreProvider>
    </ErrorBoundary>
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

function AppAnalysisErrorFallback() {
  return (
    <div className="p-6 border border-rose-500/20 rounded-lg bg-rose-500/10 flex flex-col items-center text-center">
      <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
      <h3 className="text-rose-500 font-medium text-lg">App Store Analysis Error</h3>
      <p className="text-rose-400 mb-4 max-w-md">
        We encountered an error in the App Store analysis component. This could be due to invalid data format or processing issues.
      </p>
      <Button 
        variant="outline"
        className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </div>
  );
}
