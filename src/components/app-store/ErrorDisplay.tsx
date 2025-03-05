
import { Card } from "@/components/ui/card";
import { AlertCircle, ExternalLink, RefreshCw, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextualHelp } from "@/components/ui/contextual-help";

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  variant?: "default" | "inline" | "toast";
  severity?: ErrorSeverity;
  title?: string;
  details?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  variant = "default",
  severity = 'medium',
  title,
  details
}: ErrorDisplayProps) {
  // Get appropriate error icon based on severity
  const getErrorIcon = () => {
    switch(severity) {
      case 'low':
        return <AlertTriangle className={`${variant === "inline" ? "h-4 w-4" : "h-5 w-5"} text-amber-500 mt-0.5 flex-shrink-0`} />;
      case 'critical':
        return <XCircle className={`${variant === "inline" ? "h-4 w-4" : "h-5 w-5"} text-rose-600 mt-0.5 flex-shrink-0`} />;
      default:
        return <AlertCircle className={`${variant === "inline" ? "h-4 w-4" : "h-5 w-5"} text-rose-500 mt-0.5 flex-shrink-0`} />;
    }
  };

  // Get error background color based on severity
  const getBgColor = () => {
    switch(severity) {
      case 'low':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'critical':
        return 'bg-rose-600/10 border-rose-600/20';
      default:
        return 'bg-rose-500/10 border-rose-500/20';
    }
  };

  // Get error text color based on severity
  const getTextColor = () => {
    switch(severity) {
      case 'low':
        return 'text-amber-500';
      case 'critical':
        return 'text-rose-600';
      default:
        return 'text-rose-500';
    }
  };

  // Get default title based on severity if none provided
  const errorTitle = title || (
    severity === 'critical' ? 'Critical Error' : 
    severity === 'high' ? 'Error processing data' :
    severity === 'low' ? 'Warning' :
    'Error processing analysis data'
  );

  if (variant === "toast") {
    return (
      <div className={`rounded-md p-3 ${getBgColor()} flex items-start gap-2 max-w-md`}>
        {getErrorIcon()}
        <div>
          <p className={`font-medium ${getTextColor()}`}>{errorTitle}</p>
          <p className={`text-sm mt-1 ${getTextColor().replace('500', '400')}`}>{error}</p>
          {details && <p className="text-xs mt-1 opacity-80">{details}</p>}
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className={`mt-2 p-0 h-7 ${getTextColor().replace('500', '400')} hover:bg-white/5`}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-2 ${getTextColor()} p-2 rounded-md ${getBgColor().replace('/10', '/5')}`}>
        {getErrorIcon()}
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
              className={`px-0 h-auto ${getTextColor().replace('500', '400')} hover:${getTextColor().replace('500', '300')}`}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-4 ${getBgColor()} rounded-lg`}>
      <div className="flex items-start gap-2">
        {getErrorIcon()}
        <div>
          <div className="flex items-center gap-1.5">
            <p className={`${getTextColor()} font-medium`}>{errorTitle}:</p>
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
          <p className={`${getTextColor().replace('500', '400')} text-sm mt-1`}>{error}</p>
          {details && <p className={`${getTextColor().replace('500', '300')} text-xs mt-1 italic`}>{details}</p>}
          
          {error.includes("Edge Function") && (
            <div className="flex items-start gap-1 mt-2">
              <p className={`${getTextColor().replace('500', '400')} text-xs italic`}>
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
              className={`mt-3 border-${getTextColor().replace('text-', '')} ${getTextColor().replace('500', '400')} hover:bg-${getTextColor().replace('text-', '')}/10 flex items-center gap-1.5`}
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
