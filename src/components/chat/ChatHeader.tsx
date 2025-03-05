
import { Info, Sparkles, Trash2, RefreshCw, BarChart2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { AssistantType } from "@/utils/thread-management";

interface ChatHeaderProps {
  threadId: string;
  assistantId: string;
  isCreatingThread: boolean;
  onClearConversation: () => void;
  onToggleStats?: () => void;
  onExportChat?: (format: 'json' | 'csv' | 'pdf') => void;
  feature?: AssistantType;
}

export function ChatHeader({ 
  threadId, 
  assistantId, 
  isCreatingThread, 
  onClearConversation,
  onToggleStats,
  onExportChat,
  feature = 'general'
}: ChatHeaderProps) {

  // Customize title and description based on feature
  const getTitleAndDescription = () => {
    switch (feature) {
      case 'keywords':
        return {
          title: "ASO Keywords Research Assistant",
          description: "AI-Powered Keyword Discovery & Optimization"
        };
      case 'appStore':
        return {
          title: "App Store Growth Assistant",
          description: "AI-Powered App Performance & Metadata Analysis"
        };
      default:
        return {
          title: "AI Growth Analysis Assistant",
          description: "App Store Optimization & Analytics"
        };
    }
  };

  const { title, description } = getTitleAndDescription();

  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3 bg-primary/10">
      <div className="flex items-center gap-2">
        <div className={`${feature === 'keywords' ? 'bg-indigo-600/30' : 'bg-primary/20'} h-8 w-8 rounded-full flex items-center justify-center`}>
          <Sparkles className={`h-4 w-4 ${feature === 'keywords' ? 'text-indigo-400' : 'text-primary'}`} />
        </div>
        <div>
          <h2 className="font-semibold text-white flex items-center">
            {title}
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
          <p className="text-xs text-white/60">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onToggleStats && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStats}
            className={`${feature === 'keywords' ? 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30' : 'bg-primary/20 border-primary/30 hover:bg-primary/30'} text-white text-xs`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
          </Button>
        )}
        
        {onExportChat && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`${feature === 'keywords' ? 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30' : 'bg-primary/20 border-primary/30 hover:bg-primary/30'} text-white text-xs`}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-primary-foreground/5 backdrop-blur-xl border border-white/10 text-white">
              <DropdownMenuItem onClick={() => onExportChat('json')} className={`cursor-pointer ${feature === 'keywords' ? 'hover:bg-indigo-600/20' : 'hover:bg-primary/20'}`}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportChat('csv')} className={`cursor-pointer ${feature === 'keywords' ? 'hover:bg-indigo-600/20' : 'hover:bg-primary/20'}`}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportChat('pdf')} className={`cursor-pointer ${feature === 'keywords' ? 'hover:bg-indigo-600/20' : 'hover:bg-primary/20'}`}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearConversation}
          disabled={isCreatingThread}
          className={`${feature === 'keywords' ? 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30' : 'bg-primary/20 border-primary/30 hover:bg-primary/30'} text-white text-xs gap-1`}
        >
          {isCreatingThread ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5 mr-1" />
          )}
          Clear Chat
        </Button>
      </div>
    </div>
  );
}
