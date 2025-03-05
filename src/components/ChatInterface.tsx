
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
import { exportChatHistory } from "@/services/export-service";
import { DateRange } from "@/components/chat/DateRangePicker";
import { ChatError } from "@/components/chat/ChatError";
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
  
  const { threadId, assistantId, createNewThread, isValidThread } = useThread();
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

  const handleCreateNewThread = async () => {
    setIsCreatingThread(true);
    try {
      const newThreadId = await createNewThread();
      if (newThreadId) {
        setMessages([{
          role: 'assistant',
          content: '✨ Welcome to your new conversation! How can I help you today?',
          timestamp: new Date()
        }]);
        
        toast({
          title: "New Thread Created",
          description: "Your conversation history has been reset with a new thread."
        });
      }
    } catch (error) {
      console.error('[ChatInterface] Error creating new thread:', error);
      setError('Failed to create a new conversation thread. Please try again.');
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleClearConversation = () => {
    setIsCreatingThread(true);
    try {
      setMessages([{
        role: 'assistant',
        content: '✨ Conversation cleared! How can I help you today?',
        timestamp: new Date()
      }]);
      
      toast({
        title: "Conversation Cleared",
        description: "Your conversation history has been reset."
      });
    } catch (error) {
      console.error('[ChatInterface] Error clearing conversation:', error);
      setError('Failed to clear the conversation. Please try again.');
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleReply = (content: string) => {
    setMessage(content);
    // Focus the input field
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    console.log(`Message ${messageId} received ${reaction} reaction`);
    
    // Feedback toast
    toast({
      title: reaction === 'like' ? "Thanks for the feedback!" : "Sorry about that",
      description: reaction === 'like' 
        ? "We're glad this was helpful." 
        : "We'll use your feedback to improve our responses.",
      variant: reaction === 'like' ? "default" : "destructive",
    });
  };

  const handleExportChat = async (format: 'json' | 'csv' | 'pdf') => {
    if (!threadId) {
      setError('Cannot export: No active conversation thread.');
      return;
    }
    
    try {
      toast({
        title: "Exporting conversation",
        description: `Preparing your ${format.toUpperCase()} export...`
      });
      
      await exportChatHistory(threadId, format);
      
      toast({
        title: "Export complete",
        description: `Your conversation has been exported as ${format.toUpperCase()}.`
      });
    } catch (error) {
      console.error('[ChatInterface] Export error:', error);
      setError(`Failed to export conversation: ${error.message}`);
      
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export your conversation. Please try again."
      });
    }
  };

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range);
    if (range) {
      setIsDateRangeSelected(true);
    }
  };

  const dismissError = () => setError(null);
  
  // Use the extracted ChatForm component
  const { handleSubmitWithDateCheck } = ChatForm({
    message,
    dateRange,
    onSubmit: handleSubmit,
    isDateRangeSelected,
    handleSubmit,
    setMessage
  });

  return (
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
  );
}
