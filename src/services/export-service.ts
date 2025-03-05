
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from 'file-saver';

type ExportFormat = 'json' | 'csv' | 'pdf';

/**
 * Exports chat history in the specified format
 */
export const exportChatHistory = async (
  threadId: string,
  format: ExportFormat = 'json'
): Promise<boolean> => {
  try {
    console.log(`[export-service] Exporting chat history as ${format}`);
    
    const { data, error } = await supabase.functions.invoke(
      'export-chat',
      {
        body: { 
          threadId,
          format
        }
      }
    );

    if (error) {
      console.error('[export-service] Error exporting chat:', error);
      throw error;
    }

    if (!data.success) {
      console.error('[export-service] Export failed:', data.error);
      throw new Error(data.error.message || 'Failed to export chat history');
    }

    // Handle different formats
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      saveAs(blob, `chat-export-${new Date().toISOString().slice(0, 10)}.json`);
    } else if (format === 'csv') {
      const blob = new Blob([data.data], { type: 'text/csv' });
      saveAs(blob, `chat-export-${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (format === 'pdf') {
      // For PDF we would use a client-side PDF generation library
      // or redirect to a PDF service
      console.log('[export-service] PDF data ready:', data);
      
      // For now just download as JSON with pdf extension
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      saveAs(blob, `chat-export-${new Date().toISOString().slice(0, 10)}.pdf`);
    }
    
    return true;
  } catch (error) {
    console.error('[export-service] Export error:', error);
    throw error;
  }
};
