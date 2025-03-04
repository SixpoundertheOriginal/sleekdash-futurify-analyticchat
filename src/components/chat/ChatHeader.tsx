
import { Info, Sparkles, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";

interface ChatHeaderProps {
  threadId: string;
  assistantId: string;
  isCreatingThread: boolean;
  onClearConversation: () => void;
}

export function ChatHeader({ 
  threadId, 
  assistantId, 
  isCreatingThread, 
  onClearConversation 
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3 bg-primary/10">
      <div className="flex items-center gap-2">
        <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-white flex items-center">
            AI Analysis Assistant
            {threadId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={`ml-2 ${threadId === DEFAULT_THREAD_ID ? 'bg-primary/20 hover:bg-primary/30' : 'bg-amber-500/20 hover:bg-amber-500/30'} text-xs border-0`}>
                      <Info className="h-3 w-3 mr-1" />
                      {threadId.substring(0, 8)}...
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs space-y-1">
                      <span className="block font-semibold">{threadId === DEFAULT_THREAD_ID ? "Default Thread" : "Custom Thread"}</span>
                      <span className="block opacity-80">ID: {threadId}</span>
                      <span className="block opacity-80">Assistant: {assistantId?.substring(0, 10)}...</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h2>
          <p className="text-xs text-white/60">AI-Powered Keyword Analysis</p>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClearConversation}
        disabled={isCreatingThread}
        className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white text-xs gap-1"
      >
        {isCreatingThread ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5 mr-1" />
        )}
        Clear Chat
      </Button>
    </div>
  );
}
