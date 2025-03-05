
import { Card } from "@/components/ui/card";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextualHelp } from "@/components/ui/contextual-help";

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
          <div className="flex items-center gap-1.5">
            <p className="text-sm">{error}</p>
            <ContextualHelp 
              icon="info" 
              size="sm"
              content={
                <div>
                  <p>This error may occur due to:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Network connectivity issues</li>
                    <li>Server-side processing errors</li>
                    <li>Invalid input data format</li>
                  </ul>
                </div>
              } 
            />
          </div>
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
          <div className="flex items-center gap-1.5">
            <p className="text-rose-500 font-medium">Error processing analysis data:</p>
            <ContextualHelp 
              content={
                <div>
                  <p className="font-medium mb-1">Troubleshooting Steps:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Check your network connection</li>
                    <li>Verify the format of your input data</li>
                    <li>Try again in a few minutes</li>
                    <li>Contact support if the issue persists</li>
                  </ol>
                </div>
              } 
            />
          </div>
          <p className="text-rose-400 text-sm mt-1">{error}</p>
          {error.includes("Edge Function") && (
            <div className="flex items-start gap-1 mt-2">
              <p className="text-rose-400 text-xs italic">
                This could be due to a connection issue with the Supabase Edge Function. 
                Please check that your app description contains valid data and try again.
              </p>
              <ContextualHelp 
                icon="info"
                size="sm"
                content={
                  <div>
                    <p>Edge Functions are serverless functions that process your data.</p>
                    <p className="mt-1">Common reasons for edge function errors:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Service temporarily unavailable</li>
                      <li>Request timeout due to large data processing</li>
                      <li>Input data validation failures</li>
                    </ul>
                    <a 
                      href="https://supabase.com/docs/guides/functions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary mt-2 text-xs"
                    >
                      Learn more about Edge Functions
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                } 
              />
            </div>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 border-rose-500/20 text-red-400 hover:bg-rose-500/10 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
