
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
    // Format headers for proper hierarchy and visual impact
    .replace(/^# (.*)/gm, '# $1')
    .replace(/^## (.*)/gm, '## $1')
    .replace(/^### (.*)/gm, '### $1')
    .replace(/^#### (.*)/gm, '#### $1')
    
    // Format section numbers with visual enhancements
    .replace(/^(\d+)\.\s+(.*)/gm, '## $1. $2')
    .replace(/^(\d+)\.(\d+)\.\s+(.*)/gm, '### $1.$2. $3')
    .replace(/^(\d+)\.(\d+)\.(\d+)\.\s+(.*)/gm, '#### $1.$2.$3. $4')
    
    // Convert common markdown patterns
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    .replace(/\*(.*?)\*/g, '*$1*')
    .replace(/^- /gm, '• ')
    
    // Format metrics and numbers to stand out
    .replace(/(\$[\d,]+\.?\d*)/g, '**$1**')
    .replace(/([+\-]?\d+\.?\d*%)/g, '**$1**')
    .replace(/\b(\d{4,})\b(?![^<]*>)/g, '**$1**') // Highlight large numbers
    
    // Format common metric terms in analytics reports
    .replace(/\b(ARPU|ARPPU|ARPDAU|LTV|CAC|CPI|D1|D7|D30|MTU|MAU|DAU)\b/g, '**$1**')
    .replace(/\b(ROI|ROAS|CTR|CPC|CPM|eCPM|eCPC|CVR)\b/g, '**$1**')
    
    // Enhance analysis-specific terms with emojis
    .replace(/\b(increase|growth|up|higher|grew|improved)(?!d|s)\b/gi, '📈 $1')
    .replace(/\b(decrease|decline|down|lower|reduced|dropped)(?!d|s)\b/gi, '📉 $1')
    .replace(/\bimproved\b/gi, '✨ improved')
    .replace(/\bdownloads\b/gi, '⬇️ downloads')
    .replace(/\brevenue\b/gi, '💰 revenue')
    .replace(/\bproceeds\b/gi, '💵 proceeds')
    .replace(/\busers\b/gi, '👥 users')
    .replace(/\bgrowth\b/gi, '📊 growth')
    .replace(/\btraffic\b/gi, '🔄 traffic')
    .replace(/\bconversions?\b/gi, '💫 conversion')
    .replace(/\bsuccess\b/gi, '🎯 success')
    .replace(/\bimpressions\b/gi, '👁️ impressions')
    .replace(/\boptimization\b/gi, '⚙️ optimization')
    .replace(/\bopportunity\b/gi, '🚀 opportunity')
    .replace(/\branking\b/gi, '🏆 ranking')
    .replace(/\bcompetitive\b/gi, '🥊 competitive')
    .replace(/\bsearch volume\b/gi, '🔍 search volume')
    .replace(/\btrend\b/gi, '📈 trend')
    .replace(/\bcrash(es)?\b/gi, '💥 crash$1')
    .replace(/\bretention\b/gi, '🔄 retention')
    .replace(/\benchmark\b/gi, '📏 benchmark')
    .replace(/\brecommendation\b/gi, '💡 recommendation')
    .replace(/\bstrategy\b/gi, '🎯 strategy')
    .replace(/\baction\s?items?\b/gi, '✅ action item')
    .replace(/\bpriority\b/gi, '⭐ priority');
    
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
  
  // Format key metrics with stronger highlighting
  processedContent = processedContent
    // Highlight critical metrics with background
    .replace(/([+-]?\d+(\.\d+)?%)/g, (match) => {
      if (match.startsWith('+')) {
        return `<span style="background-color: rgba(0, 255, 0, 0.15); padding: 2px 4px; border-radius: 4px; font-weight: bold;">${match}</span>`;
      } else if (match.startsWith('-')) {
        return `<span style="background-color: rgba(255, 0, 0, 0.15); padding: 2px 4px; border-radius: 4px; font-weight: bold;">${match}</span>`;
      }
      return `<span style="background-color: rgba(255, 255, 255, 0.1); padding: 2px 4px; border-radius: 4px; font-weight: bold;">${match}</span>`;
    })
    
    // Format recommendations and action items for emphasis
    .replace(/\b(Recommendation|Action Item)(\s\d+)?:\s*(.*)/gi, (match, type, num, content) => {
      return `> **${type}${num || ''}:** ${content}`;
    });
  
  return processedContent;
};
