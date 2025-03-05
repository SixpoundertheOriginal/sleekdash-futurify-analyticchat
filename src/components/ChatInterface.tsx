
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatNotifications } from "@/components/chat/ChatNotifications";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import { ChatStats } from "@/components/chat/ChatStats";
import { ChatError } from "@/components/chat/ChatError";
import { ChatContextProvider } from "@/contexts/ChatContext";
import { useChatActions } from "@/components/chat/ChatActions";
import { ChatForm } from "@/components/chat/ChatForm";

export function ChatInterface({ preprocessDataFn }: { preprocessDataFn?: (message: string) => Promise<any> }) {
  
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    isLoading,
    isProcessing,
    handleSubmit,
    fetchThreadMessages
  } = useChat(preprocessDataFn);
  
  const { threadId, assistantId, isValidThread } = useThread();
  const { toast } = useToast();
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(false);
  
  const { isCheckingForResponses, lastFileUpload, clearPollingTimers } = useMessagePolling({
    threadId,
    isLoading,
    messages,
    setMessages,
    fetchThreadMessages
  });

  const {
    handleCreateNewThread,
    handleClearConversation,
    handleExportChat,
    handleDateRangeChange,
    handleReply,
    handleReaction
  } = useChatActions({
    threadId,
    assistantId,
    messages,
    setMessages,
    setError,
    dateRange,
    setDateRange,
    setIsDateRangeSelected
  });

  const dismissError = () => setError(null);

  // Get the ChatForm utilities
  const { handleSubmitWithDateCheck } = ChatForm({
    message,
    dateRange,
    onSubmit: handleSubmit,
    isDateRangeSelected,
    handleSubmit,
    setMessage
  });

  return (
    <ChatContextProvider initialState={{
      message,
      setMessage,
      messages,
      isLoading,
      isProcessing,
      isCreatingThread,
      showStats,
      error,
      dateRange,
      isDateRangeSelected,
      lastFileUpload,
      isCheckingForResponses
    }}>
      <div className="flex h-[700px] gap-4">
        <Card className="flex flex-1 flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
          <ChatHeader 
            threadId={threadId || ""}
            assistantId={assistantId}
            isCreatingThread={isCreatingThread}
            onClearConversation={handleClearConversation}
            onToggleStats={() => setShowStats(prev => !prev)}
            onExportChat={handleExportChat}
          />
          
          <ChatError error={error} onDismiss={dismissError} />
          
          <ChatNotifications
            isValidThread={isValidThread}
            onCreateNewThread={handleCreateNewThread}
            lastFileUpload={lastFileUpload}
            isCheckingForResponses={isCheckingForResponses}
            isProcessing={isProcessing}
          />
          
          <ChatMessageList 
            messages={messages} 
            onReply={handleReply}
            onReaction={handleReaction}
          />

          <ChatInput
            message={message}
            isLoading={isLoading || isCheckingForResponses || isProcessing}
            onMessageChange={setMessage}
            onSubmit={handleSubmitWithDateCheck}
            messages={messages}
          />
        </Card>
        
        {showStats && (
          <ChatStats 
            messages={messages} 
            lastFileUpload={lastFileUpload} 
            isProcessing={isProcessing}
          />
        )}
      </div>
    </ChatContextProvider>
  );
}
