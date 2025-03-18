
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface NoMetricsAvailableProps {
  onGoToAnalysis: () => void;
}

export function NoMetricsAvailable({ onGoToAnalysis }: NoMetricsAvailableProps) {
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="text-center text-white/60">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold mb-2">No Metrics Available</h3>
        <p>Please process your data in the Analysis tab first.</p>
        <Button 
          variant="outline" 
          onClick={onGoToAnalysis} 
          className="mt-4"
        >
          Go to Analysis
        </Button>
      </div>
    </Card>
  );
}
