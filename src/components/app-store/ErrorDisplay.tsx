
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  variant?: "default" | "inline";
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  variant = "default" 
}: ErrorDisplayProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-start gap-2 text-rose-500 p-2 rounded-md bg-rose-500/5">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm">{error}</p>
          {onRetry && (
            <Button
              variant="link"
              size="sm"
              onClick={onRetry}
              className="px-0 h-auto text-rose-400 hover:text-rose-300"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-rose-500/10 border-rose-500/20 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-rose-500 font-medium">Error processing analysis data:</p>
          <p className="text-rose-400 text-sm mt-1">{error}</p>
          {error.includes("Edge Function") && (
            <p className="text-rose-400 text-xs mt-2 italic">
              This could be due to a connection issue with the Supabase Edge Function. 
              Please check that your app description contains valid data and try again.
            </p>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
