
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatNotifications } from "@/components/chat/ChatNotifications";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useMessagePolling } from "@/hooks/useMessagePolling";

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
  
  const { isCheckingForResponses, lastFileUpload } = useMessagePolling({
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
    } finally {
      setIsCreatingThread(false);
    }
  };

  return (
    <Card className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
      <ChatHeader 
        threadId={threadId || ""}
        assistantId={assistantId}
        isCreatingThread={isCreatingThread}
        onClearConversation={handleClearConversation}
      />
      
      <ChatNotifications
        isValidThread={isValidThread}
        onCreateNewThread={handleCreateNewThread}
        lastFileUpload={lastFileUpload}
        isCheckingForResponses={isCheckingForResponses}
        isProcessing={isProcessing}
      />
      
      <ChatMessageList messages={messages} />

      <ChatInput
        message={message}
        isLoading={isLoading || isCheckingForResponses || isProcessing}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
