
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ContextualHelp } from "@/components/ui/contextual-help";

interface ChatErrorProps {
  error: string | null;
  onDismiss: () => void;
}

export function ChatError({ error, onDismiss }: ChatErrorProps) {
  if (!error) return null;
  
  // Determine error type to provide appropriate help content
  const errorIsNetwork = error.toLowerCase().includes("network") || 
                         error.toLowerCase().includes("connection") || 
                         error.toLowerCase().includes("offline");
  
  const errorIsTimeout = error.toLowerCase().includes("timeout") || 
                        error.toLowerCase().includes("timed out");
  
  const errorIsPermission = error.toLowerCase().includes("permission") || 
                           error.toLowerCase().includes("unauthorized") || 
                           error.toLowerCase().includes("access");
  
  const getHelpContent = () => {
    if (errorIsNetwork) {
      return (
        <div>
          <p className="font-medium">Network Error Troubleshooting:</p>
          <ol className="list-decimal pl-4 mt-1 space-y-1 text-xs">
            <li>Check your internet connection</li>
            <li>Verify that you're not behind a restricted network</li>
            <li>Try refreshing the page</li>
            <li>Clear your browser cache and cookies</li>
          </ol>
        </div>
      );
    } else if (errorIsTimeout) {
      return (
        <div>
          <p className="font-medium">Timeout Error Troubleshooting:</p>
          <ol className="list-decimal pl-4 mt-1 space-y-1 text-xs">
            <li>The server may be experiencing high load</li>
            <li>Try again in a few minutes</li>
            <li>Consider breaking your request into smaller chunks</li>
            <li>If you're uploading a file, check that it's not too large</li>
          </ol>
        </div>
      );
    } else if (errorIsPermission) {
      return (
        <div>
          <p className="font-medium">Permission Error Troubleshooting:</p>
          <ol className="list-decimal pl-4 mt-1 space-y-1 text-xs">
            <li>Your session may have expired</li>
            <li>Try logging out and logging back in</li>
            <li>You may not have the right permissions for this action</li>
            <li>Contact support if you believe this is an error</li>
          </ol>
        </div>
      );
    } else {
      return (
        <div>
          <p className="font-medium">Error Troubleshooting:</p>
          <ol className="list-decimal pl-4 mt-1 space-y-1 text-xs">
            <li>Try the action again</li>
            <li>Refresh the page and try again</li>
            <li>Clear your browser cache and cookies</li>
            <li>Contact support if the issue persists</li>
          </ol>
        </div>
      );
    }
  };

  return (
    <Alert variant="destructive" className="mx-3 mt-2 bg-red-500/10 text-red-200 border-red-500/20">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span>{error}</span>
          <ContextualHelp 
            icon="info"
            size="sm"
            content={getHelpContent()}
          />
        </div>
        <button 
          onClick={onDismiss} 
          className="p-1"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
}
