
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
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
    
    const enhancedContent = content
      .replace(/increase/gi, '📈 increase')
      .replace(/decrease/gi, '📉 decrease')
      .replace(/improved/gi, '✨ improved')
      .replace(/KPI/gi, '🎯 KPI')
      .replace(/revenue/gi, '💰 revenue')
      .replace(/users/gi, '👥 users')
      .replace(/growth/gi, '📊 growth');

    return (
      <div className="prose prose-invert max-w-none prose-headings:text-primary prose-headings:font-semibold prose-h3:mt-4 prose-h3:mb-2">
        <ReactMarkdown>{enhancedContent}</ReactMarkdown>
      </div>
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
      <div className={`flex-1 rounded-lg p-4 ${
        message.role === 'assistant' 
          ? 'bg-white/10 text-white/90' 
          : 'bg-accent/10 text-accent'
      }`}>
        {renderMessageContent(message.content)}
      </div>
    </div>
  );
}
