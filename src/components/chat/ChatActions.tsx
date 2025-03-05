
import { useToast } from "@/components/ui/use-toast";
import { useThread } from "@/contexts/ThreadContext";
import { exportChatHistory } from "@/services/export-service";
import { DateRange } from "@/components/chat/DateRangePicker";

interface ChatActionsProps {
  threadId: string | undefined;
  assistantId: string | undefined;
  messages: any[];
  setMessages: (messages: any[]) => void;
  setError: (error: string | null) => void;
  dateRange: DateRange | null;
  setDateRange: (range: DateRange | null) => void;
  setIsDateRangeSelected: (selected: boolean) => void;
}

export function useChatActions({
  threadId,
  assistantId,
  messages,
  setMessages,
  setError,
  dateRange,
  setDateRange,
  setIsDateRangeSelected
}: ChatActionsProps) {
  const { toast } = useToast();
  const { createNewThread } = useThread();
  
  const handleCreateNewThread = async () => {
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
    }
  };

  const handleClearConversation = () => {
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
    }
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

  const handleReply = (content: string) => {
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

  return {
    handleCreateNewThread,
    handleClearConversation,
    handleExportChat,
    handleDateRangeChange,
    handleReply,
    handleReaction
  };
}
