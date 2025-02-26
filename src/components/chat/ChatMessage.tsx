
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { Card } from "@/components/ui/card";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const renderMessageContent = (content: string) => {
    // Handle mathematical formulas
    const processMathFormulas = (text: string) => {
      return text.replace(/\\\[(.*?)\\\]/g, (_, formula) => {
        return `\`${formula.trim()}\``;
      });
    };

    // Format tables from markdown syntax
    const formatTable = (tableContent: string) => {
      const rows = tableContent.split('\n').map(row => row.trim()).filter(Boolean);
      const headers = rows[0].split('|').map(cell => cell.trim()).filter(Boolean);
      
      return (
        <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-primary/20">
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-white">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, i) => (
                <tr key={i} className="border-t border-white/10 hover:bg-white/5">
                  {row.split('|').map(cell => cell.trim()).filter(Boolean).map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-white/90">
                      <ReactMarkdown>{cell}</ReactMarkdown>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    // Process the content
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

    const processedContent = processMathFormulas(enhancedContent);

    return (
      <Card className="bg-white/5 border-white/10 p-4">
        <div className="prose prose-invert max-w-none 
          prose-headings:text-primary prose-headings:font-semibold 
          prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-3
          prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
          prose-p:my-2 prose-p:leading-relaxed
          prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
          prose-li:my-1
          prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-white/10 prose-code:rounded
          prose-code:text-primary/90 prose-code:font-mono prose-code:text-sm
          prose-strong:text-primary prose-strong:font-semibold
          prose-em:text-white/75 prose-em:italic"
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 text-primary">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-medium mb-2 text-primary/90">{children}</h3>,
              h4: ({ children }) => <h4 className="text-lg font-medium mb-2 text-primary/80">{children}</h4>,
              p: ({ children }) => <p className="text-white/90 mb-2 leading-relaxed">{children}</p>,
              strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-white/75 italic">{children}</em>,
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 bg-white/10 rounded text-primary/90 font-mono text-sm">
                  {children}
                </code>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-white/90">
                  <span className="text-primary mt-1">•</span>
                  <span>{children}</span>
                </li>
              ),
              ul: ({ children }) => <ul className="space-y-2 my-2">{children}</ul>,
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                  <table className="w-full table-auto">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-primary/20">{children}</thead>,
              th: ({ children }) => (
                <th className="px-4 py-3 text-left font-semibold text-white">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-white/90 border-t border-white/10">{children}</td>
              ),
              tr: ({ children }) => <tr className="hover:bg-white/5">{children}</tr>,
            }}
          >
            {processedContent}
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
