
/**
 * Utilities for formatting message content
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
    .replace(/impressions/gi, '👁️ impressions')
    .replace(/optimization/gi, '⚙️ optimization')
    .replace(/opportunity/gi, '🚀 opportunity')
    .replace(/ranking/gi, '🏆 ranking')
    .replace(/competitive/gi, '🥊 competitive')
    .replace(/search volume/gi, '🔍 search volume')
    .replace(/trend/gi, '📈 trend');
};
