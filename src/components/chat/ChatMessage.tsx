
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { QuickReplySuggestions } from "./QuickReplySuggestions";
import { processMessageContent, formatTimestamp } from "@/utils/message-content";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

interface ChatMessageProps {
  message: Message;
  onReply?: (messageContent: string) => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export function ChatMessage({ message, onReply, onReaction }: ChatMessageProps) {
  const [processedContent, setProcessedContent] = useState<string>("Loading content...");
  const [showActions, setShowActions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    setProcessedContent(processMessageContent(message.content));
  }, [message]);
  
  const formattedTime = formatTimestamp(message.timestamp);

  // Swipe handlers for message interactions
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isExpanded) setIsExpanded(false);
    },
    onSwipedRight: () => {
      if (!isExpanded) setIsExpanded(true);
    },
    trackMouse: false,
    touchEventOptions: { passive: true }
  });

  return (
    <motion.div 
      className={`flex items-start gap-4 ${
        message.role === 'assistant' ? 'max-w-full' : 'max-w-[85%] ml-auto flex-row-reverse'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      {...swipeHandlers}
    >
      <motion.div 
        className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${
          message.role === 'assistant' 
            ? 'bg-primary/10 text-primary border border-primary/20' 
            : 'bg-accent/10 text-accent border border-accent/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {message.role === 'assistant' ? (
          <Bot className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </motion.div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs font-medium text-white/60">
            {message.role === 'assistant' ? 'AI Assistant' : 'You'}
          </span>
          <span className="font-mono text-xs text-white/40 tabular-nums">
            {formattedTime}
          </span>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`bg-white/3 border border-white/8 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                  message.role === 'assistant' ? 'bg-primary/3' : 'bg-accent/3'
                }`}
              >
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
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isExpanded && (
          <motion.div 
            className="bg-white/5 p-2 rounded-md text-white/50 text-xs cursor-pointer"
            onClick={() => setIsExpanded(true)}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Message collapsed. Click to expand.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
