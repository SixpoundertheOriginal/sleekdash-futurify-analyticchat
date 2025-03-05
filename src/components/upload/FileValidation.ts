
import { DataFormat } from "@/utils/data-processing/DataProcessingService";

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates a file based on its properties
 */
export const validateFile = (file: File): string | null => {
  // Validate file type
  const validTypes = ['.xlsx', '.xls', '.csv', '.json', '.txt'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!validTypes.includes(fileExtension)) {
    return `Unsupported file type. Please upload ${validTypes.join(', ')}`;
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return `File is too large. Maximum size is 10MB`;
  }
  
  // Validate file is not empty
  if (file.size === 0) {
    return 'File is empty';
  }
  
  return null;
}

/**
 * Gets a more detailed file format based on content and extension
 */
export const getFileFormat = (file: File): DataFormat => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return 'csv';
    case 'xlsx':
    case 'xls':
      return 'excel';
    case 'json':
      return 'json';
    case 'txt':
      return 'text';
    default:
      return 'unknown';
  }
}

/**
 * Validates the content of the file based on expected format
 */
export const validateFileContent = async (file: File, expectedFormat?: DataFormat): Promise<ValidationResult> => {
  const format = expectedFormat || getFileFormat(file);
  
  try {
    // Read a sample of the file
    const sampleSize = Math.min(file.size, 1024 * 10); // Read at most 10KB for validation
    const sampleBuffer = await file.slice(0, sampleSize).arrayBuffer();
    const sampleText = new TextDecoder().decode(sampleBuffer);
    
    switch (format) {
      case 'json':
        try {
          JSON.parse(sampleText);
          return { isValid: true, error: null };
        } catch (e) {
          return { isValid: false, error: 'Invalid JSON format' };
        }
        
      case 'csv':
        // Basic CSV validation: check that it has multiple lines and commas
        if (sampleText.includes('\n') && sampleText.includes(',')) {
          return { isValid: true, error: null };
        }
        return { isValid: false, error: 'Invalid CSV format' };
        
      case 'excel':
        // Excel validation requires actually parsing the file, which is done elsewhere
        // Just validate that it's not empty
        if (file.size > 100) { // At least 100 bytes
          return { isValid: true, error: null };
        }
        return { isValid: false, error: 'Excel file appears to be empty or invalid' };
        
      default:
        // For text and other formats, just ensure it's not empty
        if (sampleText.trim().length > 0) {
          return { isValid: true, error: null };
        }
        return { isValid: false, error: 'File appears to be empty' };
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Failed to validate file content'
    };
  }
}
