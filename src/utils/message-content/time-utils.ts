
/**
 * Utilities for handling time in messages
 */

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
