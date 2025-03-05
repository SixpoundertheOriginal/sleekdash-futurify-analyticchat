
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { QuickReplySuggestions } from "./QuickReplySuggestions";
import { processMessageContent, formatTimestamp } from "@/utils/message-content-utils";

interface ChatMessageProps {
  message: Message;
  onReply?: (messageContent: string) => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export function ChatMessage({ message, onReply, onReaction }: ChatMessageProps) {
  const [processedContent, setProcessedContent] = useState<string>("Loading content...");
  const [showActions, setShowActions] = useState(false);
  
  useEffect(() => {
    // Process the message content when the message changes
    setProcessedContent(processMessageContent(message.content));
  }, [message]);
  
  // Format timestamp
  const formattedTime = formatTimestamp(message.timestamp);

  return (
    <div 
      className={`flex items-start gap-3 animate-fade-up ${
        message.role === 'assistant' ? 'max-w-full' : 'max-w-[85%] ml-auto flex-row-reverse'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        message.role === 'assistant' 
          ? 'bg-primary/20 text-primary' 
          : 'bg-accent/20 text-accent'
      }`}>
        {message.role === 'assistant' ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-white/60">
            {message.role === 'assistant' ? 'AI Assistant' : 'You'}
          </span>
          <span className="text-xs text-white/40">
            {formattedTime}
          </span>
        </div>
        <Card className={`bg-white/5 border-none p-4 shadow-sm transition-all duration-200 ${
          message.role === 'assistant' ? 'bg-primary/5' : 'bg-accent/5'
        }`}>
          <MessageContent content={processedContent} />
          
          {/* Message Actions (like, dislike, copy, etc.) */}
          <MessageActions 
            showActions={showActions}
            messageId={message.id}
            messageRole={message.role}
            messageContent={processedContent}
            onReply={onReply}
            onReaction={onReaction}
          />
          
          {/* Quick Reply Suggestions */}
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
