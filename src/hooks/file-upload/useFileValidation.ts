
import { useState, useCallback } from "react";
import { validateFileType } from "@/utils/file-processing";
import { useToast } from "@/components/ui/use-toast";
import { DataFormat } from "@/utils/data-processing/DataProcessingService";

export interface UseFileValidationReturn {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  validateFile: (file: File) => Promise<boolean>;
  supportedFormats: DataFormat[];
}

export function useFileValidation(): UseFileValidationReturn {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Define all supported file formats
  const supportedFormats: DataFormat[] = ['csv', 'excel', 'json', 'text'];

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback(async (file: File): Promise<boolean> => {
    clearError();
    
    if (!await validateFileType(file, toast)) {
      setError(`Invalid file type: ${file.name}. Please upload an Excel or CSV file.`);
      return false;
    }
    
    return true;
  }, [clearError, toast]);

  return {
    error,
    setError,
    clearError,
    validateFile,
    supportedFormats
  };
}
