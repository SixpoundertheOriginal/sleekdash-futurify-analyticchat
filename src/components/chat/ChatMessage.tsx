
import { Bot, User, MessageSquareReply, ThumbsUp, ThumbsDown, Copy, Pin } from "lucide-react";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: Message;
  onReply?: (messageContent: string) => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

export function ChatMessage({ message, onReply, onReaction }: ChatMessageProps) {
  const [processedContent, setProcessedContent] = useState<string>("Loading content...");
  const [showActions, setShowActions] = useState(false);
  const [reactions, setReactions] = useState<{likes: number, dislikes: number}>({likes: 0, dislikes: 0});
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  
  useEffect(() => {
    // Process the message content when the message changes
    processMessageContent();
  }, [message]);
  
  const processMessageContent = () => {
    let content = message.content;
    
    // Check if content is not a string (could be an object from OpenAI API)
    if (typeof content !== 'string') {
      console.log('[ChatMessage] Received non-string content:', content);
      
      // Handle OpenAI new format where content might be an array
      if (Array.isArray(content)) {
        // Extract the text from the content array
        const textParts = content
          .filter((item: any) => item.type === 'text')
          .map((item: any) => item.text?.value || '');
        
        if (textParts.length > 0) {
          content = textParts.join('\n\n');
        } else {
          // Fallback - stringify the content
          content = JSON.stringify(content);
        }
      } else {
        // Fallback - stringify the content
        content = JSON.stringify(content);
      }
    }

    // Handle empty content or problematic values
    if (!content || content === "[]" || content.trim() === "") {
      console.warn('[ChatMessage] Empty or invalid content detected');
      content = "Content unavailable. Please try again or upload a new file.";
    }
    
    // Process the content for better display
    const enhancedContent = content
      .replace(/^### (.*)/gm, '## $1')
      .replace(/^#### (.*)/gm, '### $1')
      .replace(/\*\*(.*?)\*\*/g, '**$1**')
      .replace(/^- /gm, '• ')
      .replace(/(\$[\d,]+\.?\d*)/g, '**$1**')
      .replace(/([+\-]?\d+\.?\d*%)/g, '**$1**')
      .replace(/increase/gi, '📈 increase')
      .replace(/decrease/gi, '📉 decrease')
      .replace(/improved/gi, '✨ improved')
      .replace(/downloads/gi, '⬇️ downloads')
      .replace(/revenue/gi, '💰 revenue')
      .replace(/users/gi, '👥 users')
      .replace(/growth/gi, '📊 growth');
      
    setProcessedContent(enhancedContent);
  };

  // Format timestamp
  const formattedTime = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleReaction = (type: 'like' | 'dislike') => {
    if (userReaction === type) {
      // User is toggling the reaction off
      setUserReaction(null);
      setReactions(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] - 1
      }));
    } else {
      // User is changing reaction or adding a new one
      if (userReaction) {
        // Remove previous reaction
        setReactions(prev => ({
          ...prev,
          [userReaction === 'like' ? 'likes' : 'dislikes']: prev[userReaction === 'like' ? 'likes' : 'dislikes'] - 1
        }));
      }
      
      // Add new reaction
      setUserReaction(type);
      setReactions(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] + 1
      }));
    }
    
    if (onReaction && message.id) {
      onReaction(message.id, type);
    }
  };

  // Function to copy message content to clipboard
  const copyToClipboard = () => {
    if (typeof processedContent === 'string') {
      navigator.clipboard.writeText(processedContent);
    }
  };

  // Function to suggest quick replies based on message content
  const getSuggestedReplies = () => {
    if (message.role !== 'assistant') return [];
    
    const content = typeof message.content === 'string' ? message.content : '';
    
    // Simple keyword-based suggestions
    if (content.includes('keyword')) {
      return ["Tell me more about top keywords", "What's the competition like?"];
    } else if (content.includes('performance')) {
      return ["Show me detailed metrics", "How can I improve?"];
    } else if (content.includes('trend')) {
      return ["What's driving this trend?", "Compare to last month"];
    }
    
    // Default suggestions
    return ["Tell me more", "Can you explain that?"];
  };

  return (
    <div 
      className={`flex items-start gap-3 animate-fade-up ${
        message.role === 'assistant' ? 'max-w-full' : 'max-w-[85%] ml-auto flex-row-reverse'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        message.role === 'assistant' 
          ? 'bg-primary/20 text-primary' 
          : 'bg-accent/20 text-accent'
      }`}>
        {message.role === 'assistant' ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-white/60">
            {message.role === 'assistant' ? 'AI Assistant' : 'You'}
          </span>
          <span className="text-xs text-white/40">
            {formattedTime}
          </span>
        </div>
        <Card className={`bg-white/5 border-none p-4 shadow-sm transition-all duration-200 ${
          message.role === 'assistant' ? 'bg-primary/5' : 'bg-accent/5'
        }`}>
          <div className="prose prose-invert max-w-none 
            prose-headings:text-primary prose-headings:font-semibold 
            prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-3
            prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3
            prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
            prose-p:my-2 prose-p:leading-relaxed
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-2
            prose-li:my-0.5
            prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-white/10 prose-code:rounded
            prose-code:text-primary/90 prose-code:font-mono prose-code:text-sm
            prose-strong:text-primary prose-strong:font-semibold
            prose-em:text-white/75 prose-em:italic"
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-2 text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-primary/90">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base font-medium mb-1.5 text-primary/80">{children}</h4>,
                p: ({ children }) => <p className="text-white/90 mb-2 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-white/75 italic">{children}</em>,
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 bg-white/10 rounded text-primary/90 font-mono text-sm">
                    {children}
                  </code>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                    <table className="w-full table-auto">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-primary/20">{children}</thead>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold text-white text-sm">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-white/90 border-t border-white/10 text-sm">{children}</td>
                ),
                tr: ({ children }) => <tr className="hover:bg-white/5">{children}</tr>,
                ul: ({ children }) => <ul className="space-y-1 my-2 pl-2">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-1.5 text-white/90 text-sm">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span>{children}</span>
                  </li>
                ),
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
          
          {/* Message Actions */}
          {showActions && (
            <div className={`flex items-center gap-1 mt-2 pt-2 border-t border-white/10 
              ${message.role === 'assistant' ? 'justify-between' : 'justify-end'}`}>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 h-7 ${userReaction === 'like' ? 'text-green-500' : 'text-white/40'}`}
                          onClick={() => handleReaction('like')}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {reactions.likes > 0 && <span className="ml-1 text-xs">{reactions.likes}</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Helpful</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 h-7 ${userReaction === 'dislike' ? 'text-red-500' : 'text-white/40'}`}
                          onClick={() => handleReaction('dislike')}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          {reactions.dislikes > 0 && <span className="ml-1 text-xs">{reactions.dislikes}</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Not helpful</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 h-7 text-white/40" onClick={copyToClipboard}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 h-7 text-white/40">
                          <Pin className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Pin this insight</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 h-7 text-white/40"
                      onClick={() => onReply && onReply(message.content.toString())}
                    >
                      <MessageSquareReply className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Reply</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {/* Quick Reply Suggestions (only for assistant messages) */}
          {message.role === 'assistant' && (
            <div className="flex flex-wrap gap-2 mt-3">
              {getSuggestedReplies().map((suggestion, index) => (
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
          )}
        </Card>
      </div>
    </div>
  );
}
