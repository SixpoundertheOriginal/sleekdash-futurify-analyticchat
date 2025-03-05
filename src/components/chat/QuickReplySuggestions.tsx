
import { Button } from "@/components/ui/button";
import { getSuggestedReplies } from "@/utils/message-content-utils";
import { useState, useEffect } from "react";

interface QuickReplySuggestionsProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  onReply?: (content: string) => void;
}

export function QuickReplySuggestions({ content, role, onReply }: QuickReplySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    // Only show suggestions for assistant messages
    if (role !== 'assistant') {
      setSuggestions([]);
      return;
    }
    
    // Get suggestions based on content
    const newSuggestions = getSuggestedReplies(content.toString(), role);
    setSuggestions(newSuggestions);
  }, [content, role]);
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size="sm" 
          className="px-3 py-1 h-auto text-xs bg-white/5 hover:bg-white/10 text-white/70"
          onClick={() => onReply && onReply(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
