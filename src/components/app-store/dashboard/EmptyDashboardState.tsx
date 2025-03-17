
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, RefreshCw } from "lucide-react";

interface EmptyDashboardStateProps {
  onRetry?: () => void;
}

export function EmptyDashboardState({ onRetry }: EmptyDashboardStateProps) {
  return (
    <Card className="p-6 bg-white/5 border-white/10 text-center">
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="bg-primary/10 rounded-full p-4">
          <BarChart className="h-8 w-8 text-primary/70" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">No Analysis Data Available</h3>
          <p className="text-white/60 mb-6">Run an analysis first to see your dashboard with visualized metrics</p>
          {onRetry && (
            <div className="flex justify-center">
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Go to Input Tab
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
