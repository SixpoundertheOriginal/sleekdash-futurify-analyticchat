
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Copy, Pin, MessageSquareReply } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

interface MessageActionsProps {
  showActions: boolean;
  messageId?: string;
  messageRole: 'user' | 'assistant' | 'system';
  messageContent: string;
  onReply?: (messageContent: string) => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export function MessageActions({ 
  showActions, 
  messageId, 
  messageRole, 
  messageContent,
  onReply, 
  onReaction 
}: MessageActionsProps) {
  const [reactions, setReactions] = useState<{likes: number, dislikes: number}>({likes: 0, dislikes: 0});
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  
  if (!showActions) return null;
  
  const handleReaction = (type: 'like' | 'dislike') => {
    if (userReaction === type) {
      // User is toggling the reaction off
      setUserReaction(null);
      setReactions(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] - 1
      }));
    } else {
      // User is changing reaction or adding a new one
      if (userReaction) {
        // Remove previous reaction
        setReactions(prev => ({
          ...prev,
          [userReaction === 'like' ? 'likes' : 'dislikes']: prev[userReaction === 'like' ? 'likes' : 'dislikes'] - 1
        }));
      }
      
      // Add new reaction
      setUserReaction(type);
      setReactions(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] + 1
      }));
    }
    
    if (onReaction && messageId) {
      onReaction(messageId, type);
    }
  };

  // Function to copy message content to clipboard
  const copyToClipboard = () => {
    if (typeof messageContent === 'string') {
      navigator.clipboard.writeText(messageContent);
    }
  };

  return (
    <div className={`flex items-center gap-1 mt-2 pt-2 border-t border-white/10 
      ${messageRole === 'assistant' ? 'justify-between' : 'justify-end'}`}>
      {messageRole === 'assistant' && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 h-7 ${userReaction === 'like' ? 'text-green-500' : 'text-white/40'}`}
                  onClick={() => handleReaction('like')}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {reactions.likes > 0 && <span className="ml-1 text-xs">{reactions.likes}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Helpful</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 h-7 ${userReaction === 'dislike' ? 'text-red-500' : 'text-white/40'}`}
                  onClick={() => handleReaction('dislike')}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  {reactions.dislikes > 0 && <span className="ml-1 text-xs">{reactions.dislikes}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Not helpful</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 h-7 text-white/40" onClick={copyToClipboard}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Copy to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 h-7 text-white/40">
                  <Pin className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Pin this insight</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2 h-7 text-white/40"
              onClick={() => onReply && onReply(messageContent.toString())}
            >
              <MessageSquareReply className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Reply</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
