
import { useCallback } from "react";
import { processExcelFile, validateFileContent } from "@/utils/file-processing";
import { processData, DataFormat } from "@/utils/data-processing/DataProcessingService";
import { useToast } from "@/components/ui/use-toast";

export interface ProcessingResult {
  content: string;
  format: DataFormat;
  success: boolean;
}

export interface UseFileProcessorReturn {
  processFileContent: (file: File) => Promise<ProcessingResult | null>;
}

export function useFileProcessor(): UseFileProcessorReturn {
  const { toast } = useToast();

  const processFileContent = useCallback(async (file: File): Promise<ProcessingResult | null> => {
    try {
      console.log(`[FileProcessor] Processing file: ${file.name}`);

      let fileContent = '';
      
      // Determine file format based on extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      let formatHint: DataFormat = 'text';
      
      if (fileExtension === 'csv') {
        formatHint = 'csv';
        fileContent = await file.text();
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        formatHint = 'excel';
        fileContent = await processExcelFile(file);
      } else if (fileExtension === 'json') {
        formatHint = 'json';
        fileContent = await file.text();
      } else {
        // Default to text
        fileContent = await file.text();
      }
      
      console.log(`[FileProcessor] File format detected: ${formatHint}`);

      // Process the file data using our DataProcessingService
      const processingResult = processData(fileContent, {
        formatHint,
        extractMetrics: true
      });
      
      if (!processingResult.success) {
        throw new Error(`Processing failed: ${processingResult.error}`);
      }
      
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
      
      return {
        content: fileContent,
        format: processingResult.format,
        success: true
      };
    } catch (error) {
      console.error('[FileProcessor] Error processing file:', error);
      return null;
    }
  }, [toast]);

  return {
    processFileContent
  };
}
