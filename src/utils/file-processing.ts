
import * as XLSX from 'xlsx';
import { useToast } from "@/components/ui/use-toast";

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

export async function processExcelFile(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { 
      type: 'array',
      cellDates: true,
      dateNF: 'YYYY-MM-DD',
      raw: false
    });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    console.log('[FileProcessor] Excel sheet name:', firstSheetName);
    
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to CSV with good formatting for dates and numbers
    const fileContent = XLSX.utils.sheet_to_csv(worksheet, {
      blankrows: false,
      dateNF: 'YYYY-MM-DD',
      strip: true,
      rawNumbers: false
    });
    
    console.log('[FileProcessor] Excel processed to CSV, length:', fileContent.length);
    return fileContent;
  } catch (error) {
    console.error('[FileProcessor] Error processing Excel file:', error);
    throw new Error(`Error reading Excel file: ${error.message}`);
  }
}

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
