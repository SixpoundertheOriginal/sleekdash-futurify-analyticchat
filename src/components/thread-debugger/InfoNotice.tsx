
import React from "react";
import { Info, HelpCircle } from "lucide-react";
import { ContextualHelp } from "@/components/ui/contextual-help";

export function InfoNotice() {
  return (
    <div className="mt-2 p-2 bg-amber-500/10 rounded-md flex items-start gap-2">
      <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-amber-300/90">
            When you create a new thread, the conversation history starts fresh. 
            Use this tool only for debugging thread-related issues.
          </p>
          <ContextualHelp 
            icon="help"
            size="sm"
            position="top"
            content={
              <div>
                <p className="font-medium">Thread Debugging Guide:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>Thread ID: Unique identifier for your conversation history</li>
                  <li>Assistant ID: Identifies which AI model is responding</li>
                  <li>Create Thread: Starts a completely new conversation</li>
                  <li>Check Thread: Validates if a thread is working correctly</li>
                </ul>
                <p className="mt-2 text-xs font-medium">When to use thread debugging:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>If responses seem to lack context</li>
                  <li>If the AI doesn't remember previous information</li>
                  <li>If you want to intentionally start a fresh conversation</li>
                </ul>
              </div>
            } 
          />
        </div>
      </div>
    </div>
  );
}
