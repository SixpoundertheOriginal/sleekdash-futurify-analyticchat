
import { supabase } from '@/integrations/supabase/client';
import { AssistantType, getThreadData, getAssistantId, saveThreadId } from '@/utils/thread-management';

/**
 * Create a new thread through the Edge Function
 */
export const createNewThread = async (
  activeFeature: AssistantType,
  onSuccess?: (threadId: string) => void,
  onError?: (error: Error) => void
): Promise<string | null> => {
  try {
    console.log(`[ThreadContextUtils] Creating new thread for ${activeFeature} feature...`);
    
    const { data, error } = await supabase.functions.invoke('create-thread', {
      body: {}
    });

    if (error) {
      console.error('[ThreadContextUtils] Edge function error:', error);
      if (onError) onError(new Error(error.message));
      return null;
    }
    
    if (!data || !data.threadId) {
      console.error('[ThreadContextUtils] Invalid response:', data);
      if (onError) onError(new Error("No thread ID returned in response"));
      return null;
    }

    console.log(`[ThreadContextUtils] Thread created successfully for ${activeFeature}: ${data.threadId}`);
    
    // Save the thread ID for the current feature
    saveThreadId(activeFeature, data.threadId);
    
    if (onSuccess) onSuccess(data.threadId);
    
    return data.threadId;
  } catch (error) {
    console.error('[ThreadContextUtils] Error creating thread:', error);
    if (onError) onError(error instanceof Error ? error : new Error("Unknown error"));
    return null;
  }
};

/**
 * Tests thread validity by making a call to the edge function
 */
export const testThread = async (
  threadId: string,
  assistantId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`[ThreadContextUtils] Testing thread: ${threadId}`);
    
    const { data, error } = await supabase.functions.invoke('test-thread', {
      body: { 
        threadId: threadId,
        assistantId: assistantId
      }
    });
    
    if (error || !data?.success) {
      console.warn('[ThreadContextUtils] Thread validation failed:', error || data?.error);
      return { 
        success: false, 
        error: error?.message || data?.error || 'Unknown validation error'
      };
    }
    
    console.log('[ThreadContextUtils] Thread validation successful');
    return { success: true };
  } catch (e) {
    console.warn('[ThreadContextUtils] Error testing thread:', e);
    return { 
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    };
  }
};
