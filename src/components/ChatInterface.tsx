
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
import { DateRange } from "@/components/chat/DateRangePicker";
import { AssistantType } from "@/utils/thread-management";

interface ChatInterfaceProps {
  preprocessDataFn?: (message: string) => Promise<any>;
  feature?: AssistantType;
}

export function ChatInterface({ preprocessDataFn, feature = 'general' }: ChatInterfaceProps) {
  
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    isLoading,
    isProcessing,
    handleSubmit,
    fetchThreadMessages
  } = useChat({
    preprocessDataFn,
    feature
  });
  
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

  const { handleSubmitWithDateCheck } = ChatForm({
    message,
    dateRange,
    onSubmit: handleSubmit,
    isDateRangeSelected,
    handleSubmit,
    setMessage,
    feature
  });

  return (
    <ChatContextProvider initialState={{
      message,
      setMessage,
      messages,
      setMessages,
      isLoading,
      isProcessing,
      isCreatingThread,
      setIsCreatingThread,
      showStats,
      setShowStats,
      error,
      setError,
      dateRange,
      setDateRange,
      isDateRangeSelected,
      setIsDateRangeSelected,
      lastFileUpload,
      isCheckingForResponses
    }}>
      <div className="flex flex-col md:flex-row gap-4 h-[60vh] min-h-[400px] max-h-[800px]">
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
          <div className="hidden md:block w-full md:w-72 lg:w-80">
            <ChatStats 
              messages={messages} 
              lastFileUpload={lastFileUpload} 
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>
    </ChatContextProvider>
  );
}
