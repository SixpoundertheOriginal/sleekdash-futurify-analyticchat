
import { useState, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';

<lov-add-dependency>react-markdown@latest</lov-add-dependency>

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '✨ Welcome! I\'m your AI assistant. Upload your marketing data, and I\'ll help you analyze it.'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>('thread_HBqkU1GtWrBXoJwfyLZrswcb');
  const { toast } = useToast();

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
          if (payload.new && payload.new.openai_analysis) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: payload.new.openai_analysis
            }]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          body: { 
            message: userMessage,
            threadId: threadId 
          }
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!functionData || !functionData.analysis) {
        throw new Error('No response received from the assistant');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: functionData.analysis
      }]);

    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ I apologize, but I encountered an error processing your message. Please try again.' 
      }]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your message. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    if (content.includes('|')) {
      const lines = content.split('\n');
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <tbody>
              {lines.map((line, index) => {
                if (line.trim()) {
                  const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
                  return (
                    <tr key={index} className={`
                      ${index === 0 ? "bg-primary/20 font-semibold" : "border-t border-white/10"}
                      ${line.toLowerCase().includes('increase') ? 'bg-green-500/10' : ''}
                      ${line.toLowerCase().includes('decrease') ? 'bg-red-500/10' : ''}
                      hover:bg-white/5 transition-colors
                    `}>
                      {cells.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 whitespace-pre-wrap break-words">
                          <ReactMarkdown className="prose prose-invert">{cell}</ReactMarkdown>
                        </td>
                      ))}
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      );
    }
    
    const enhancedContent = content
      .replace(/increase/gi, '📈 increase')
      .replace(/decrease/gi, '📉 decrease')
      .replace(/improved/gi, '✨ improved')
      .replace(/KPI/gi, '🎯 KPI')
      .replace(/revenue/gi, '💰 revenue')
      .replace(/users/gi, '👥 users')
      .replace(/growth/gi, '📊 growth');

    return (
      <ReactMarkdown 
        className="prose prose-invert max-w-none prose-headings:text-primary prose-headings:font-semibold prose-h3:mt-4 prose-h3:mb-2"
      >
        {enhancedContent}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex h-[700px] flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 p-4 bg-primary/10">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h2 className="font-semibold text-white">AI Analysis Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-start gap-3 animate-fade-up">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              msg.role === 'assistant' 
                ? 'bg-primary/20' 
                : 'bg-accent/20'
            }`}>
              {msg.role === 'assistant' ? (
                <Bot className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-accent" />
              )}
            </div>
            <div className={`flex-1 rounded-lg p-4 ${
              msg.role === 'assistant' 
                ? 'bg-white/10 text-white/90' 
                : 'bg-accent/10 text-accent'
            }`}>
              {renderMessageContent(msg.content)}
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
            placeholder={isLoading ? "✨ Processing..." : "Ask about your data..."}
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
