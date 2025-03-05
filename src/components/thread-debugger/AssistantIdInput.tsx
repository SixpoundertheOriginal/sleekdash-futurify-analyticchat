
import React from "react";
import { Input } from "@/components/ui/input";
import { ContextualHelp } from "@/components/ui/contextual-help";

interface AssistantIdInputProps {
  assistantId: string;
  onChange: (value: string) => void;
}

export function AssistantIdInput({ assistantId, onChange }: AssistantIdInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-display text-white text-sm">Assistant ID:</span>
        <ContextualHelp
          icon="info"
          size="sm"
          position="top"
          content={
            <div className="space-y-2">
              <p className="font-display font-medium gradient-text">About Assistant IDs</p>
              <p className="mt-1 text-xs">Each assistant has a unique ID that determines:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                <li>The model's capabilities and behavior</li>
                <li>Access to specific tools and knowledge</li>
                <li>Response format and style</li>
              </ul>
              <p className="mt-1 text-xs">Different features use different assistants specialized for that purpose.</p>
              <p className="mt-2 text-xs font-mono text-primary/90">Advanced: Only change this if you know what you're doing.</p>
            </div>
          }
        />
      </div>
      <Input 
        value={assistantId} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="Assistant ID"
        className="font-mono interactive-bg border-white/10 text-white focus:border-primary/30 transition-all duration-300"
      />
    </div>
  );
}
