
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatNotificationsProps {
  isValidThread: boolean;
  onCreateNewThread: () => void;
  lastFileUpload: Date | null;
  isCheckingForResponses: boolean;
  isProcessing: boolean;
}

export function ChatNotifications({
  isValidThread,
  onCreateNewThread,
  lastFileUpload,
  isCheckingForResponses,
  isProcessing
}: ChatNotificationsProps) {
  return (
    <>
      {!isValidThread && (
        <div className="flex items-center gap-2 p-2 bg-red-500/20 text-red-200 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">
            Thread validation failed. Messages may not be stored correctly.
            <Button
              variant="link"
              className="text-red-200 underline pl-1 h-auto p-0 text-xs"
              onClick={onCreateNewThread}
            >
              Create new thread?
            </Button>
          </span>
        </div>
      )}
      
      {lastFileUpload && (isCheckingForResponses || isProcessing) && (
        <div className="flex items-center gap-2 p-2 bg-blue-500/20 text-blue-200 text-xs border-b border-blue-500/20">
          <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin" />
          <span>
            File uploaded at {lastFileUpload.toLocaleTimeString()}. Analyzing your data...
          </span>
        </div>
      )}
    </>
  );
}
