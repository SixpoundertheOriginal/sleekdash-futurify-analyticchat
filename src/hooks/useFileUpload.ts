
import { useCallback } from "react";
import { useFileValidation } from "./file-upload/useFileValidation";
import { useUploadProgress } from "./file-upload/useUploadProgress";
import { useFileProcessor } from "./file-upload/useFileProcessor";
import { useFileSubmission } from "./file-upload/useFileSubmission";
import { useDragAndDrop } from "./file-upload/useDragAndDrop";
import { DataFormat } from "@/utils/data-processing/DataProcessingService";

export interface UseFileUploadReturn {
  dragActive: boolean;
  uploading: boolean;
  progress: number;
  error: string | null;
  supportedFormats: DataFormat[];
  handleDrag: (e: React.DragEvent) => void;
  processFile: (file: File) => Promise<void>;
  setDragActive: (active: boolean) => void;
  resetState: () => void;
}

export function useFileUpload(threadId: string | null, assistantId: string | null): UseFileUploadReturn {
  // Use smaller, focused hooks
  const { error, setError, clearError, validateFile, supportedFormats } = useFileValidation();
  const { uploading, progress, setUploading, setProgress, resetProgress } = useUploadProgress();
  const { processFileContent } = useFileProcessor();
  const { submitFile, validateSubmissionParams } = useFileSubmission();
  const { dragActive, setDragActive, handleDrag, resetDragState } = useDragAndDrop();

  const processFile = async (file: File) => {
    clearError();
    
    if (!validateSubmissionParams(threadId, assistantId)) {
      return;
    }
    
    if (!await validateFile(file)) {
      return;
    }

    setUploading(true);
    setProgress(10);
    
    try {
      console.log(`[FileUpload] Processing file: ${file.name}`);
      setProgress(20);
      
      const processingResult = await processFileContent(file);
      if (!processingResult) {
        throw new Error("Failed to process file content");
      }
      
      setProgress(50);

      const submissionResult = await submitFile({
        fileContent: processingResult.content,
        fileName: file.name,
        format: processingResult.format,
        threadId: threadId!,
        assistantId: assistantId!
      });
      
      setProgress(100);
      
      if (!submissionResult) {
        throw new Error("Failed to submit file for analysis");
      }

    } catch (error) {
      console.error('[FileUpload] Error processing file:', error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const resetState = useCallback(() => {
    resetDragState();
    resetProgress();
    clearError();
  }, [resetDragState, resetProgress, clearError]);

  return {
    dragActive,
    uploading,
    progress,
    error,
    supportedFormats,
    handleDrag,
    processFile,
    setDragActive,
    resetState
  };
}
