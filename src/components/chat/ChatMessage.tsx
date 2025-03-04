
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const renderMessageContent = (content: any) => {
    // Check if content is not a string (could be an object from OpenAI API)
    if (typeof content !== 'string') {
      console.log('[ChatMessage] Received non-string content:', content);
      
      // Handle OpenAI new format where content might be an array
      if (Array.isArray(content) && content.length > 0) {
        // Extract the text from the content array
        const textContent = content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          content = textContent.text.value || JSON.stringify(textContent);
        } else {
          // Fallback - stringify the content
          content = JSON.stringify(content);
        }
      } else {
        // Fallback - stringify the content
        content = JSON.stringify(content);
      }
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

    return (
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
            {enhancedContent}
          </ReactMarkdown>
        </div>
      </Card>
    );
  };

  return (
    <div className={`flex items-start gap-3 animate-fade-up ${
      message.role === 'assistant' ? 'max-w-full' : 'max-w-[85%] ml-auto flex-row-reverse'
    }`}>
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
        {renderMessageContent(message.content)}
      </div>
    </div>
  );
}
