
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
        <span className="text-white text-sm">Assistant ID:</span>
        <ContextualHelp
          icon="info"
          size="sm"
          position="top"
          content={
            <div>
              <p className="font-medium">About Assistant IDs</p>
              <p className="mt-1 text-xs">Each assistant has a unique ID that determines:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                <li>The model's capabilities and behavior</li>
                <li>Access to specific tools and knowledge</li>
                <li>Response format and style</li>
              </ul>
              <p className="mt-1 text-xs">Different features use different assistants specialized for that purpose.</p>
              <p className="mt-2 text-xs text-amber-300">Advanced: Only change this if you know what you're doing.</p>
            </div>
          }
        />
      </div>
      <Input 
        value={assistantId} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="Assistant ID"
        className="bg-black/30 border-white/10 text-white"
      />
    </div>
  );
}
