
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface ThreadIdInputProps {
  threadId: string;
  isValidThread: boolean;
  isTestingThread: boolean;
  onChange: (value: string) => void;
  onTest: () => void;
  onCopy: (text: string) => void;
}

export function ThreadIdInput({
  threadId,
  isValidThread,
  isTestingThread,
  onChange,
  onTest,
  onCopy
}: ThreadIdInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white text-sm">Thread ID:</span>
        <Badge 
          variant={isValidThread ? "default" : "destructive"}
          className="px-2 py-0.5 flex items-center gap-1"
        >
          {isValidThread ? (
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
          ) : (
            <XCircle className="h-3.5 w-3.5 mr-1" />
          )}
          {isValidThread ? "Valid" : "Invalid"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center relative">
          <Input 
            value={threadId} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="Thread ID"
            className="bg-black/30 border-white/10 text-white pr-8"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 text-white/60 hover:text-white"
            onClick={() => onCopy(threadId)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white"
          onClick={onTest}
          disabled={isTestingThread}
        >
          {isTestingThread ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            "Test"
          )}
        </Button>
      </div>
    </div>
  );
}
