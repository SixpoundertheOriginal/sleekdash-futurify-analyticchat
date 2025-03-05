
// Different export formatters for chat history

// Helper function to sanitize text for CSV export
const sanitizeForCSV = (text: string): string => {
  // Replace quotes with double quotes (CSV standard for escaping)
  return text.replace(/"/g, '""');
};

// Convert chat history to CSV format
export const formatAsCSV = (messages: any[]): string => {
  // CSV header
  let csv = '"Timestamp","Role","Content"\n';
  
  // Add each message as a row
  for (const message of messages) {
    const timestamp = message.created_at || new Date().toISOString();
    const role = message.role || 'unknown';
    
    // Handle content that might be an object or array
    let content = '';
    if (typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.content)) {
      content = message.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text?.value || '')
        .join('\n');
    } else if (message.content && typeof message.content === 'object') {
      content = JSON.stringify(message.content);
    }
    
    // Sanitize and format CSV row
    csv += `"${timestamp}","${role}","${sanitizeForCSV(content)}"\n`;
  }
  
  return csv;
};

// Convert chat history to JSON format
export const formatAsJSON = (messages: any[]): string => {
  // Create a structured representation with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(msg => {
      // Create a clean structure for each message
      return {
        id: msg.id || null,
        created_at: msg.created_at || new Date().toISOString(),
        role: msg.role || 'unknown',
        content: msg.content,
        metadata: msg.metadata || null
      };
    })
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Convert chat history to plain text format
export const formatAsText = (messages: any[]): string => {
  let text = 'CHAT HISTORY\n\n';
  
  for (const message of messages) {
    const timestamp = message.created_at 
      ? new Date(message.created_at).toLocaleString()
      : new Date().toLocaleString();
    
    const role = message.role ? message.role.toUpperCase() : 'UNKNOWN';
    
    // Handle content extraction
    let content = '';
    if (typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.content)) {
      content = message.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text?.value || '')
        .join('\n');
    } else if (message.content && typeof message.content === 'object') {
      content = JSON.stringify(message.content, null, 2);
    }
    
    text += `[${timestamp}] ${role}:\n${content}\n\n`;
  }
  
  return text;
};

// Convert chat history to HTML format
export const formatAsHTML = (messages: any[]): string => {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Chat Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .message { margin-bottom: 20px; padding: 10px; border-radius: 8px; }
    .user { background-color: #f0f0f0; }
    .assistant { background-color: #e6f7ff; }
    .system { background-color: #f9f9f9; font-style: italic; }
    .timestamp { color: #666; font-size: 12px; margin-bottom: 5px; }
    .role { font-weight: bold; }
    .content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Chat Export</h1>
  <p>Exported on: ${new Date().toLocaleString()}</p>
  <div class="messages">
`;

  for (const message of messages) {
    const timestamp = message.created_at 
      ? new Date(message.created_at).toLocaleString()
      : new Date().toLocaleString();
    
    const role = message.role || 'unknown';
    
    // Handle content extraction
    let content = '';
    if (typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.content)) {
      content = message.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text?.value || '')
        .join('\n');
    } else if (message.content && typeof message.content === 'object') {
      content = JSON.stringify(message.content, null, 2);
    }
    
    // Sanitize content for HTML
    content = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    html += `
    <div class="message ${role}">
      <div class="timestamp">${timestamp}</div>
      <div class="role">${role.toUpperCase()}</div>
      <div class="content">${content}</div>
    </div>
`;
  }

  html += `
  </div>
</body>
</html>`;

  return html;
};

// Determine format and return the formatted chat history
export const formatChatHistory = (messages: any[], format: string): { data: string, mimeType: string } => {
  switch (format?.toLowerCase()) {
    case 'csv':
      return { 
        data: formatAsCSV(messages),
        mimeType: 'text/csv'
      };
    case 'json':
      return { 
        data: formatAsJSON(messages),
        mimeType: 'application/json'
      };
    case 'html':
      return { 
        data: formatAsHTML(messages),
        mimeType: 'text/html'
      };
    case 'text':
    default:
      return { 
        data: formatAsText(messages),
        mimeType: 'text/plain'
      };
  }
};
