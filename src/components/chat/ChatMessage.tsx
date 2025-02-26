
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const renderMessageContent = (content: string) => {
    // Handle tabular data if present
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
                          <div className="prose prose-invert">
                            <ReactMarkdown>{cell}</ReactMarkdown>
                          </div>
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

    // Format the content to handle markdown formatting
    const enhancedContent = content
      .replace(/^### (.*)/gm, '## $1')  // Enhance h3 headers
      .replace(/^#### (.*)/gm, '### $1') // Enhance h4 headers
      .replace(/\*\*(.*?)\*\*/g, '**$1**')  // Keep bold text
      .replace(/^- /gm, '• ')  // Convert basic lists to bullet points
      .replace(/([+\-]?\d+\.?\d*%)/g, '**$1**') // Bold percentages
      .replace(/\$\d+\.?\d*/g, (match) => `**${match}**`) // Bold monetary values
      .replace(/increase/gi, '📈 increase')
      .replace(/decrease/gi, '📉 decrease')
      .replace(/improved/gi, '✨ improved')
      .replace(/downloads/gi, '⬇️ downloads')
      .replace(/revenue/gi, '💰 revenue')
      .replace(/users/gi, '👥 users')
      .replace(/growth/gi, '📊 growth');

    return (
      <Card className="bg-white/5 border-white/10 p-4">
        <div className="prose prose-invert max-w-none 
          prose-headings:text-primary prose-headings:font-semibold 
          prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-3
          prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
          prose-p:my-2
          prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
          prose-li:my-1
          prose-strong:text-primary prose-strong:font-semibold"
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 text-primary">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-medium mb-2 text-primary/90">{children}</h3>,
              h4: ({ children }) => <h4 className="text-lg font-medium mb-2 text-primary/80">{children}</h4>,
              p: ({ children }) => <p className="text-white/90 mb-2">{children}</p>,
              strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-white/90">
                  <span className="text-primary">•</span>
                  <span>{children}</span>
                </li>
              ),
              ul: ({ children }) => <ul className="space-y-2 my-2">{children}</ul>,
            }}
          >
            {enhancedContent}
          </ReactMarkdown>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
        message.role === 'assistant' 
          ? 'bg-primary/20' 
          : 'bg-accent/20'
      }`}>
        {message.role === 'assistant' ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-accent" />
        )}
      </div>
      <div className="flex-1">
        {renderMessageContent(message.content)}
      </div>
    </div>
  );
}
