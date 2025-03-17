
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface InvalidMetricsStateProps {
  onRetry?: () => void;
}

export function InvalidMetricsState({ onRetry }: InvalidMetricsStateProps) {
  return (
    <Card className="p-6 bg-white/5 border-white/10 text-center">
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="bg-amber-500/10 rounded-full p-4">
          <AlertTriangle className="h-8 w-8 text-amber-500/70" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Limited Data Available</h3>
          <p className="text-white/60 mb-6">The analysis didn't produce enough metrics for visualization</p>
          {onRetry && (
            <div className="flex justify-center">
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Another Analysis
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
