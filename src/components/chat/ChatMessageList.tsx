
import { useRef, useEffect } from "react";
import { Message } from "@/types/chat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AssistantType } from "@/utils/thread-management";

interface ChatMessageListProps {
  messages: Message[];
  onReply: (content: string) => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
  feature?: AssistantType;
}

export function ChatMessageList({ messages, onReply, onReaction, feature = 'general' }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      {messages.map((msg, index) => (
        <ChatMessage 
          key={`${msg.id || msg.role}-${index}`} 
          message={msg} 
          onReply={onReply}
          onReaction={onReaction}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
