
import * as ExcelJS from 'exceljs';
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
    const workbook = new ExcelJS.Workbook();
    
    // Load Excel file from buffer
    await workbook.xlsx.load(buffer);
    
    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("No worksheets found in the Excel file");
    }
    
    console.log('[FileProcessor] Excel sheet name:', worksheet.name);
    
    // Convert to CSV
    let csvContent = '';
    
    // Process header row
    const headerRow = worksheet.getRow(1);
    const headerValues = [];
    headerRow.eachCell({ includeEmpty: false }, cell => {
      headerValues.push(formatCellValueForCsv(cell.value));
    });
    csvContent += headerValues.join(',') + '\n';
    
    // Process data rows
    const rowCount = worksheet.rowCount;
    for (let i = 2; i <= rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowValues = [];
      
      // Check if row has any values
      let hasValues = false;
      row.eachCell({ includeEmpty: false }, () => {
        hasValues = true;
      });
      
      if (hasValues) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Make sure we don't exceed the header length
          if (colNumber <= headerValues.length) {
            rowValues.push(formatCellValueForCsv(cell.value));
          }
        });
        csvContent += rowValues.join(',') + '\n';
      }
    }
    
    console.log('[FileProcessor] Excel processed to CSV, length:', csvContent.length);
    return csvContent;
  } catch (error) {
    console.error('[FileProcessor] Error processing Excel file:', error);
    throw new Error(`Error reading Excel file: ${error.message}`);
  }
}

// Helper function to properly format cell values for CSV
function formatCellValueForCsv(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle dates
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  // Handle rich text
  if (typeof value === 'object' && value.richText) {
    return value.richText.map(part => part.text).join('');
  }
  
  // Handle formulas - get the result
  if (typeof value === 'object' && value.result !== undefined) {
    return formatCellValueForCsv(value.result);
  }
  
  // Convert to string and escape quotes for CSV
  const stringValue = String(value);
  
  // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
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
