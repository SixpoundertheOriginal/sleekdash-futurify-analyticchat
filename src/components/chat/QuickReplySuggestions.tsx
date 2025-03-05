
import { Button } from "@/components/ui/button";
import { getSuggestedReplies, extractKeywords } from "@/utils/message-content-utils";
import { useState, useEffect } from "react";
import { detectContentType } from "@/utils/analytics/offline-processing";

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
    
    // Convert content to string if needed
    const contentStr = content?.toString() || '';
    
    // Get suggestions based on content
    const newSuggestions = getSuggestedReplies(contentStr, role);
    
    // If no context-specific suggestions were found, generate based on content type
    if (newSuggestions.length === 0 || (newSuggestions.length === 3 && newSuggestions[0] === "Tell me more")) {
      // Extract keywords to determine content type
      const keywords = extractKeywords(contentStr);
      const contentType = detectContentType(contentStr);
      
      // Generate content-type specific suggestions
      if (contentType === 'keywords') {
        setSuggestions([
          "Show me high-volume keywords",
          "Which keywords have low competition?",
          "How can I improve my keyword rankings?"
        ]);
      } else if (contentType === 'analytics') {
        setSuggestions([
          "What's causing the trends?",
          "How do I improve these metrics?",
          "Compare to industry benchmarks"
        ]);
      } else {
        // Use the default suggestions
        setSuggestions(newSuggestions);
      }
    } else {
      setSuggestions(newSuggestions);
    }
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
