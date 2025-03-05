
import { Send, Loader2, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Message } from "@/types/chat";
import { ContextualHelp } from "@/components/ui/contextual-help";
import { AssistantType } from "@/utils/thread-management";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  messages: Message[];
  feature?: AssistantType;
}

export function ChatInput({ message, isLoading, onMessageChange, onSubmit, messages, feature = 'general' }: ChatInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate suggestions based on current input and conversation history
  useEffect(() => {
    if (message.trim().length > 2) {
      generateSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [message]);

  const generateSuggestions = () => {
    const query = message.toLowerCase().trim();
    
    // Basic pattern matching for different query types
    let newSuggestions: string[] = [];
    
    if (query.includes('keyword') || query.startsWith('key')) {
      newSuggestions = [
        "Show me my best performing keywords",
        "Keywords with highest conversion rate",
        "Keywords with lowest competition"
      ];
    } else if (query.includes('trend') || query.includes('performance')) {
      newSuggestions = [
        "Show me performance trends over time",
        "What are the emerging trends in my data?",
        "Compare current performance with last month"
      ];
    } else if (query.includes('file') || query.includes('upload')) {
      newSuggestions = [
        "How do I upload a file?",
        "What file formats are supported?",
        "Analyze my uploaded file"
      ];
    }
    
    // Filter suggestions based on the current input
    const filteredSuggestions = newSuggestions.filter(s => 
      s.toLowerCase().includes(query) && s.toLowerCase() !== query
    );
    
    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const selectSuggestion = (suggestion: string) => {
    onMessageChange(suggestion);
    setShowSuggestions(false);
  };

  // Customize placeholder based on feature
  const getPlaceholder = () => {
    if (isLoading) return "Processing...";
    
    switch (feature) {
      case 'keywords':
        return "Ask about your keyword data...";
      case 'appStore':
        return "Ask about your app analytics...";
      default:
        return "Type your message here...";
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-white/10 p-3 bg-white/5">
      <div className="relative">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2d3748] border border-white/10 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-2 text-sm"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ContextualHelp 
            content={
              <div>
                <p className="font-medium">Chat Commands & Tips:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Use <span className="font-mono text-xs">/help</span> for command list</li>
                  <li>Use <span className="font-mono text-xs">/clear</span> to reset conversation</li>
                  <li>Be specific in your questions for better results</li>
                  <li>Include keywords, time periods, or specific metrics in your questions</li>
                </ul>
                <p className="mt-2 text-xs">Example queries:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>"Show me top performing keywords last month"</li>
                  <li>"What's my user retention trend?"</li>
                  <li>"Compare conversion rates across countries"</li>
                </ul>
              </div>
            } 
          />
          <Button 
            type="submit" 
            disabled={isLoading || !message.trim()}
            className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${
              !message.trim() && !isLoading ? 'opacity-50' : ''
            }`}
            variant={message.trim() ? "default" : "outline"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
