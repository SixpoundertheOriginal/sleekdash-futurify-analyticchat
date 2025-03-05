
import { useToast } from "@/components/ui/use-toast";

/**
 * Validates if the file type is supported
 */
export async function validateFileType(file: File, toast: ReturnType<typeof useToast>['toast']) {
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
    toast({
      variant: "destructive",
      title: "Invalid file type",
      description: "Please upload an Excel or CSV file (.xlsx, .xls, .csv)"
    });
    return false;
  }
  return true;
}

/**
 * Validates if the file content is valid
 */
export async function validateFileContent(fileContent: string): Promise<void> {
  if (!fileContent || fileContent.trim().length === 0) {
    throw new Error("File appears to be empty");
  }

  // Check if file content seems valid (has at least header row and one data row)
  const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("File must contain a header row and at least one data row");
  }

  console.log('[FileProcessor] Processed file lines:', lines.length);
  console.log('[FileProcessor] First few rows:', lines.slice(0, 3));
}
