
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
