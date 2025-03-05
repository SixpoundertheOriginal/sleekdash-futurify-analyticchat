
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
  let processedContent = content
    // Format headers properly to ensure they render as headers
    .replace(/^### (.*)/gm, '## $1')
    .replace(/^#### (.*)/gm, '### $1')
    .replace(/^# (.*)/gm, '# $1')
    .replace(/^##(?!#) (.*)/gm, '## $1')
    
    // Convert common markdown patterns
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    .replace(/\*(.*?)\*/g, '*$1*')
    .replace(/^- /gm, '• ')
    
    // Format metrics and numbers to stand out
    .replace(/(\$[\d,]+\.?\d*)/g, '**$1**')
    .replace(/([+\-]?\d+\.?\d*%)/g, '**$1**')
    .replace(/\b(\d{4,})\b(?![^<]*>)/g, '**$1**') // Highlight large numbers
    
    // Enhance analysis-specific terms with emojis
    .replace(/increase(?!d)/gi, '📈 increase')
    .replace(/decrease(?!d)/gi, '📉 decrease')
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
    
  // Detect and format table-like structures
  if (content.includes('|') && !content.includes('```')) {
    const lines = content.split('\n');
    const tableLines = [];
    let inTable = false;
    let tableStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('|') && line.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableStartIndex = i;
        }
        tableLines.push(line);
      } else if (inTable) {
        // End of table detected
        if (tableLines.length > 1) {
          // Insert table header divider if missing
          if (tableLines.length > 1 && !tableLines[1].match(/^[\s|:-]+$/)) {
            const headerParts = tableLines[0].split('|').length;
            const divider = '|' + Array(headerParts).join('---|') + '---|';
            tableLines.splice(1, 0, divider);
          }
          
          // Replace the table lines in the original content
          const tableContent = tableLines.join('\n');
          const contentBefore = lines.slice(0, tableStartIndex).join('\n');
          const contentAfter = lines.slice(i).join('\n');
          
          processedContent = contentBefore + '\n\n' + tableContent + '\n\n' + contentAfter;
        }
        
        inTable = false;
        tableLines.length = 0;
      }
    }
    
    // Handle table at the end of content
    if (inTable && tableLines.length > 1) {
      // Insert table header divider if missing
      if (tableLines.length > 1 && !tableLines[1].match(/^[\s|:-]+$/)) {
        const headerParts = tableLines[0].split('|').length;
        const divider = '|' + Array(headerParts).join('---|') + '---|';
        tableLines.splice(1, 0, divider);
      }
      
      // Replace the table lines in the original content
      const tableContent = tableLines.join('\n');
      const contentBefore = lines.slice(0, tableStartIndex).join('\n');
      
      processedContent = contentBefore + '\n\n' + tableContent;
    }
  }
  
  return processedContent;
};
