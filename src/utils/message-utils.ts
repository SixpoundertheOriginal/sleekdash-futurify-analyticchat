
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
  // Filter out processing messages
  const filteredMessages = prevMessages.filter(msg => 
    msg.role !== 'assistant' || 
    !msg.content.includes("I'm processing your file")
  );
  
  return [...filteredMessages, ...newMessages];
};
