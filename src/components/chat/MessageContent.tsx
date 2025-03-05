
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="prose prose-invert max-w-none 
      prose-headings:font-display prose-headings:text-primary 
      prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-semibold prose-h1:mt-6 prose-h1:mb-3
      prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-5 prose-h2:mb-3
      prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2
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
          h1: ({ children }) => (
            <motion.h1 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl sm:text-3xl font-display font-bold mb-3 border-b border-primary/20 pb-2"
            >
              {children}
            </motion.h1>
          ),
          h2: ({ children }) => (
            <motion.h2 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl sm:text-2xl font-display font-semibold mb-2 text-primary flex items-center gap-2 before:content-[''] before:w-1.5 before:h-5 before:bg-primary before:rounded-sm"
            >
              <span className="pl-2">{children}</span>
            </motion.h2>
          ),
          h3: ({ children }) => (
            <motion.h3 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-lg sm:text-xl font-display font-medium mb-2 text-primary/90 flex items-center gap-1.5"
            >
              <span className="inline-block w-1 h-4 bg-primary/70 rounded-sm"></span>
              {children}
            </motion.h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-display font-medium mb-1.5 text-primary/80 pl-3 border-l-2 border-primary/50">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-white/90 mb-2 leading-relaxed"
            >
              {children}
            </motion.p>
          ),
          strong: ({ children }) => (
            <strong className="text-primary font-semibold bg-primary/10 px-1 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-accent italic not-italic font-medium">
              {children}
            </em>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-white/10 rounded text-primary/90 font-mono text-sm">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
              <table className="w-full table-auto font-mono text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary/20 font-display sticky top-0">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-display font-semibold text-white text-sm">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-white/90 border-t border-white/10 text-sm font-mono tabular-nums">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/5 transition-colors">
              {children}
            </tr>
          ),
          ul: ({ children }) => (
            <motion.ul 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-2 my-3 pl-3"
            >
              {children}
            </motion.ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-white/90 text-sm">
              <span className="text-primary mt-1 flex-shrink-0 inline-block w-2 h-2 rounded-full bg-primary"></span>
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 italic text-white/80 my-4 bg-white/5 py-2 pr-2 rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
