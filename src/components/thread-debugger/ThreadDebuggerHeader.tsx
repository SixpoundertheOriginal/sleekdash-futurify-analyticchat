
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ThreadDebuggerHeaderProps {
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export function ThreadDebuggerHeader({ 
  showAdvanced, 
  onToggleAdvanced 
}: ThreadDebuggerHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          ASO Thread Debugger
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleAdvanced}
          className="text-white/60 hover:text-white"
        >
          {showAdvanced ? "Simple Mode" : "Advanced Mode"}
        </Button>
      </div>
      <CardDescription className="text-white/60">
        Diagnose and fix thread-related issues for ASO analysis
      </CardDescription>
    </>
  );
}
