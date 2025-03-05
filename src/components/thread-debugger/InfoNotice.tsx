
import React from "react";
import { Info } from "lucide-react";

export function InfoNotice() {
  return (
    <div className="mt-2 p-2 bg-amber-500/10 rounded-md flex items-start gap-2">
      <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-300/90">
        When you create a new thread, the conversation history starts fresh. 
        Use this tool only for debugging thread-related issues.
      </p>
    </div>
  );
}
