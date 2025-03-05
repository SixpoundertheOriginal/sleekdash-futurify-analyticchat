
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { processExcelFile, validateFileContent, validateFileType } from "@/utils/file-processing";

export interface UseFileUploadReturn {
  dragActive: boolean;
  uploading: boolean;
  progress: number;
  error: string | null;
  handleDrag: (e: React.DragEvent) => void;
  processFile: (file: File) => Promise<void>;
  setDragActive: (active: boolean) => void;
  resetState: () => void;
}

export function useFileUpload(threadId: string | null, assistantId: string | null): UseFileUploadReturn {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    
    if (!await validateFileType(file, toast)) {
      setError(`Invalid file type: ${file.name}. Please upload an Excel or CSV file.`);
      return;
    }

    setUploading(true);
    setProgress(10);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload files");
      }

      console.log(`[FileUpload] Processing file: ${file.name}`);
      console.log(`[FileUpload] Using thread ID for file processing: ${threadId}`);
      console.log(`[FileUpload] Using assistant ID for file processing: ${assistantId}`);

      if (!threadId || !assistantId) {
        throw new Error("Thread or assistant ID is missing. Cannot process file.");
      }

      let fileContent = '';
      setProgress(20);
      
      // Process based on file type
      if (file.name.endsWith('.csv')) {
        fileContent = await file.text();
        console.log('[FileUpload] CSV detected, processed text length:', fileContent.length);
      } else {
        // For Excel files
        fileContent = await processExcelFile(file);
      }
      
      setProgress(40);

      try {
        await validateFileContent(fileContent);
      } catch (validationError) {
        toast({
          variant: "destructive",
          title: "File validation failed",
          description: validationError.message
        });
        throw validationError;
      }
      
      setProgress(50);

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
            assistantId
          }
        }
      );
      
      setProgress(80);

      if (functionError) {
        console.error('[FileUpload] Function error:', functionError);
        throw functionError;
      }

      if (!functionData) {
        throw new Error('No data returned from analysis');
      }

      console.log('[FileUpload] Function response:', functionData);
      setProgress(90);

      // Check if there's an OpenAI error in the response
      if (functionData.error) {
        console.error('[FileUpload] OpenAI error:', functionData.error);
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: functionData.error.message || "OpenAI couldn't process this file correctly."
        });
      } else {
        toast({
          title: "Analysis complete",
          description: "Your keywords have been processed successfully."
        });
      }
      
      setProgress(95);

      // Store the analysis in the database with explicitly specified columns
      const { error: dbError } = await supabase
        .from('keyword_analyses')
        .insert({
          file_name: file.name,
          file_path: file.name,
          prioritized_keywords: functionData.data || [],
          openai_analysis: functionData.analysis || "Analysis could not be completed",
          app_performance: 'Medium',
          created_at: new Date().toISOString(),
          user_id: user.id
        });
        
      setProgress(100);

      if (dbError) {
        console.error('[FileUpload] Database error:', dbError);
        throw dbError;
      }

    } catch (error) {
      console.error('[FileUpload] Error processing file:', error);
      setError(error.message || "Failed to process the file. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process the file. Please try again."
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const resetState = () => {
    setDragActive(false);
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    dragActive,
    uploading,
    progress,
    error,
    handleDrag,
    processFile,
    setDragActive,
    resetState
  };
}
