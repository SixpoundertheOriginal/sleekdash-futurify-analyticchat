
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { QuickReplySuggestions } from "./QuickReplySuggestions";
import { processMessageContent, formatTimestamp } from "@/utils/message-content";

interface ChatMessageProps {
  message: Message;
  onReply?: (messageContent: string) => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export function ChatMessage({ message, onReply, onReaction }: ChatMessageProps) {
  const [processedContent, setProcessedContent] = useState<string>("Loading content...");
  const [showActions, setShowActions] = useState(false);
  
  useEffect(() => {
    setProcessedContent(processMessageContent(message.content));
  }, [message]);
  
  const formattedTime = formatTimestamp(message.timestamp);

  return (
    <div 
      className={`flex items-start gap-4 animate-fade-up ${
        message.role === 'assistant' ? 'max-w-full' : 'max-w-[85%] ml-auto flex-row-reverse'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${
        message.role === 'assistant' 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'bg-accent/10 text-accent border border-accent/20'
      }`}>
        {message.role === 'assistant' ? (
          <Bot className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs font-medium text-white/60">
            {message.role === 'assistant' ? 'AI Assistant' : 'You'}
          </span>
          <span className="font-mono text-xs text-white/40 tabular-nums">
            {formattedTime}
          </span>
        </div>
        <Card className={`bg-white/3 border border-white/8 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ${
          message.role === 'assistant' ? 'bg-primary/3' : 'bg-accent/3'
        }`}>
          <MessageContent content={processedContent} />
          
          <MessageActions 
            showActions={showActions}
            messageId={message.id}
            messageRole={message.role}
            messageContent={processedContent}
            onReply={onReply}
            onReaction={onReaction}
          />
          
          <QuickReplySuggestions 
            content={processedContent}
            role={message.role}
            onReply={onReply}
          />
        </Card>
      </div>
    </div>
  );
}
