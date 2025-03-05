
import React from "react";
import { Info, HelpCircle } from "lucide-react";
import { ContextualHelp } from "@/components/ui/contextual-help";

export function InfoNotice() {
  return (
    <div className="mt-2 p-2 bg-primary/5 rounded-md flex items-start gap-2 border border-primary/10 hover:bg-primary/10 transition-all duration-300">
      <Info className="h-4 w-4 text-primary/80 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-sans text-white/90">
            When you create a new thread, the conversation history starts fresh. 
            Use this tool only for debugging thread-related issues.
          </p>
          <ContextualHelp 
            icon="help"
            size="sm"
            position="top"
            content={
              <div className="space-y-2">
                <p className="font-display font-semibold gradient-text">Thread Debugging Guide:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>Thread ID: <span className="font-mono">Unique identifier for your conversation history</span></li>
                  <li>Assistant ID: <span className="font-mono">Identifies which AI model is responding</span></li>
                  <li>Create Thread: <span className="font-mono">Starts a completely new conversation</span></li>
                  <li>Check Thread: <span className="font-mono">Validates if a thread is working correctly</span></li>
                </ul>
                <p className="mt-2 text-xs font-display font-medium">When to use thread debugging:</p>
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
