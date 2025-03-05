
import React from "react";
import { Input } from "@/components/ui/input";

interface AssistantIdInputProps {
  assistantId: string;
  onChange: (value: string) => void;
}

export function AssistantIdInput({ assistantId, onChange }: AssistantIdInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white text-sm">Assistant ID:</span>
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
