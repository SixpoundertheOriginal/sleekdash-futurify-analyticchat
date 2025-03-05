import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { DateRange } from "@/components/chat/DateRangePicker";

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

  const handleSubmitWithDateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDateRangeSelected && !message.trim().startsWith('/')) {
      setError('Please select a date range before sending your message.');
      toast({
        variant: "destructive",
        title: "Date Range Required",
        description: "Please select a date range to continue with your analysis."
      });
      return;
    }
    
    // Append date range info to the message if needed
    if (isDateRangeSelected && dateRange && !message.trim().startsWith('/')) {
      const originalMessage = message;
      const dateInfo = `Date range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}.\n\n`;
      setMessage(dateInfo + originalMessage);
      handleSubmit(e);
      // Reset to original message to avoid showing the date prefix in the input
      setTimeout(() => setMessage(""), 100);
    } else {
      handleSubmit(e);
    }
  };

  const dismissError = () => setError(null);

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
        
        {error && (
          <Alert variant="destructive" className="mx-3 mt-2 bg-red-500/10 text-red-200 border-red-500/20">
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={dismissError} className="p-1">
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        )}
        
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
          onSubmit={handleSubmit}
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
