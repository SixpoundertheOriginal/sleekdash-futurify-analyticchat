
/**
 * Utility functions for processing message content
 */

/**
 * Processes the message content to make it more readable and visually appealing
 */
export const processMessageContent = (content: any): string => {
  // Check if content is not a string (could be an object from OpenAI API)
  if (typeof content !== 'string') {
    console.log('[MessageContentUtils] Received non-string content:', content);
    
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
    console.warn('[MessageContentUtils] Empty or invalid content detected');
    content = "Content unavailable. Please try again or upload a new file.";
  }
  
  // Process the content for better display
  return content
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
    .replace(/growth/gi, '📊 growth')
    .replace(/traffic/gi, '🔄 traffic')
    .replace(/conversions/gi, '💫 conversions')
    .replace(/success/gi, '🎯 success')
    .replace(/impressions/gi, '👁️ impressions');
};

/**
 * Generate suggested replies based on message content
 */
export const getSuggestedReplies = (content: string, role: string): string[] => {
  if (role !== 'assistant') return [];
  
  // Convert to lowercase for case-insensitive matching
  const contentLower = content.toLowerCase();
  
  // More comprehensive keyword-based suggestions
  if (contentLower.includes('keyword')) {
    return [
      "Tell me more about top keywords", 
      "What's the competition like?",
      "How can I improve my keyword rankings?"
    ];
  } else if (contentLower.includes('performance')) {
    return [
      "Show me detailed metrics", 
      "How can I improve?",
      "Compare with industry benchmarks"
    ];
  } else if (contentLower.includes('trend')) {
    return [
      "What's driving this trend?", 
      "Compare to last month",
      "Is this seasonal?"
    ];
  } else if (contentLower.includes('analysis')) {
    return [
      "Show me the data breakdown", 
      "What actions should I take?",
      "What insights can you extract?"
    ];
  } else if (contentLower.includes('report') || contentLower.includes('insight')) {
    return [
      "Export this report", 
      "Highlight key findings",
      "Summarize the main points"
    ];
  } else if (contentLower.includes('competitors') || contentLower.includes('competition')) {
    return [
      "Who are my top competitors?",
      "How do I compare to the market?",
      "What strategies are working for others?"
    ];
  } else if (contentLower.includes('recommendation') || contentLower.includes('suggest')) {
    return [
      "Give me specific action items",
      "Prioritize these recommendations",
      "What's the expected impact?"
    ];
  } else if (contentLower.includes('data') || contentLower.includes('metrics')) {
    return [
      "Visualize this data",
      "Show me trends over time",
      "What metrics matter most?"
    ];
  }
  
  // If content contains numbers or percentages, offer analytics-focused replies
  if (/\d+%|\$\d+|[\d,]+\.?\d*/.test(content)) {
    return [
      "Analyze these numbers",
      "What's causing these changes?",
      "How can we improve these metrics?"
    ];
  }
  
  // Default suggestions
  return ["Tell me more", "Can you explain that?", "What actions should I take?"];
};

/**
 * Format timestamp 
 */
export const formatTimestamp = (timestamp: string | Date | undefined): string => {
  if (!timestamp) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  try {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) {
    console.warn('[MessageContentUtils] Error formatting timestamp:', e);
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

/**
 * Extract keywords from content for better suggestions
 * @param content The message content
 * @returns Array of extracted keywords
 */
export const extractKeywords = (content: string): string[] => {
  if (!content || typeof content !== 'string') return [];
  
  // Simple keyword extraction based on frequency and importance
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)  // Only words longer than 3 chars
    .filter(word => !['this', 'that', 'with', 'from', 'have', 'your'].includes(word)); // Filter common words
  
  // Count word frequency
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
};
