
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { DataFormat } from "@/utils/data-processing/DataProcessingService";

export interface SubmissionParams {
  fileContent: string;
  fileName: string;
  format: DataFormat;
  threadId: string;
  assistantId: string;
}

export interface UseFileSubmissionReturn {
  submitFile: (params: SubmissionParams) => Promise<boolean>;
  validateSubmissionParams: (threadId: string | null, assistantId: string | null) => boolean;
}

export function useFileSubmission(): UseFileSubmissionReturn {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const validateSubmissionParams = useCallback((threadId: string | null, assistantId: string | null): boolean => {
    if (!threadId || !assistantId) {
      toast({
        variant: "destructive",
        title: "Missing Parameters",
        description: "Thread or assistant ID is missing. Cannot process file."
      });
      return false;
    }
    return true;
  }, [toast]);

  const submitFile = useCallback(async (params: SubmissionParams): Promise<boolean> => {
    const { fileContent, fileName, format, threadId, assistantId } = params;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload files");
      }

      console.log(`[FileSubmission] Using thread ID: ${threadId}`);
      console.log(`[FileSubmission] Using assistant ID: ${assistantId}`);
      
      // Call the Edge Function with file content
      toast({
        title: "Processing file",
        description: "Your file is being analyzed. This may take a moment..."
      });

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'process-keywords',
        {
          body: { 
            fileContent,
            threadId,
            assistantId,
            format
          }
        }
      );

      if (functionError) {
        console.error('[FileSubmission] Function error:', functionError);
        throw functionError;
      }

      if (!functionData) {
        throw new Error('No data returned from analysis');
      }

      console.log('[FileSubmission] Function response:', functionData);

      // Check if there's an OpenAI error in the response
      if (functionData.error) {
        console.error('[FileSubmission] OpenAI error:', functionData.error);
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: functionData.error.message || "OpenAI couldn't process this file correctly."
        });
        return false;
      } else {
        toast({
          title: "Analysis complete",
          description: "Your file has been processed successfully."
        });
      }

      // Store the analysis in the database with explicitly specified columns
      const { error: dbError } = await supabase
        .from('keyword_analyses')
        .insert({
          file_name: fileName,
          file_path: fileName,
          prioritized_keywords: functionData.data || [],
          openai_analysis: functionData.analysis || "Analysis could not be completed",
          app_performance: 'Medium',
          created_at: new Date().toISOString(),
          user_id: user.id,
          format
        });

      if (dbError) {
        console.error('[FileSubmission] Database error:', dbError);
        throw dbError;
      }

      return true;
    } catch (error) {
      console.error('[FileSubmission] Error submitting file:', error);
      handleError(error, "File Submission");
      return false;
    }
  }, [handleError, toast]);

  return {
    submitFile,
    validateSubmissionParams
  };
}
