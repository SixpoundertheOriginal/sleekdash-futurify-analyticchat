
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ThreadDebuggerActionsProps {
  isCreatingThread: boolean;
  onResetDefaults: () => void;
  onCreateNewThread: () => void;
  onApplyChanges: () => void;
}

export function ThreadDebuggerActions({
  isCreatingThread,
  onResetDefaults,
  onCreateNewThread,
  onApplyChanges
}: ThreadDebuggerActionsProps) {
  return (
    <div className="flex justify-between border-t border-white/10 p-4 bg-black/20">
      <Button
        variant="outline"
        size="sm"
        className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-white"
        onClick={onResetDefaults}
      >
        Reset to Defaults
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white"
          onClick={onCreateNewThread}
          disabled={isCreatingThread}
        >
          {isCreatingThread ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
          ) : null}
          Create New Thread
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-primary hover:bg-primary/90"
          onClick={onApplyChanges}
        >
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
