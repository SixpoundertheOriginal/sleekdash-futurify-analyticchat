
import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Welcome! I\'m your AI assistant. Upload your marketing data, and I\'ll help you analyze it.'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Set up Supabase realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('chat_interface')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keyword_analyses',
        },
        (payload) => {
          console.log('Received new analysis:', payload);
          // Add the analysis to chat when new analysis is created
          if (payload.new && payload.new.openai_analysis) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: payload.new.openai_analysis
            }]);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'chat-message',
        {
          body: { message: userMessage }
        }
      );

      if (functionError) throw functionError;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: functionData.analysis || "I couldn't process that request. Please try again."
      }]);

    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your message. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 p-4 bg-white/5">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-white">AI Analysis Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 rounded-lg bg-white/10 p-4 text-white/90">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 bg-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isLoading ? "Processing..." : "Ask about your data..."}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
