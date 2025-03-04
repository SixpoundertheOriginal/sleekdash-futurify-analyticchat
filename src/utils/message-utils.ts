
import { Message } from "@/types/chat";

/**
 * Adds user message to the messages array
 */
export const addUserMessage = (messages: Message[], content: string): Message[] => {
  return [...messages, { role: 'user', content }];
};

/**
 * Adds assistant message to the messages array
 */
export const addAssistantMessage = (
  messages: Message[], 
  content: string, 
  messageId?: string
): Message[] => {
  return [...messages, { 
    role: 'assistant', 
    content,
    id: messageId
  }];
};

/**
 * Removes processing messages and adds new messages
 */
export const updateMessagesWithResponse = (
  prevMessages: Message[], 
  newMessages: Message[]
): Message[] => {
  // Check for duplicate messages by ID
  const existingIds = new Set(
    prevMessages
      .filter(msg => msg.id)
      .map(msg => msg.id)
  );
  
  // Only add messages that don't already exist
  const filteredNewMessages = newMessages.filter(msg => 
    !msg.id || !existingIds.has(msg.id)
  );
  
  // No new unique messages to add
  if (filteredNewMessages.length === 0) {
    return prevMessages;
  }
  
  // Filter out processing messages
  const filteredMessages = prevMessages.filter(msg => 
    msg.role !== 'assistant' || 
    !msg.content.includes("I'm processing your file")
  );
  
  return [...filteredMessages, ...filteredNewMessages];
};
