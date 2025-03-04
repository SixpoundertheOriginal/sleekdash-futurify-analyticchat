
import { processFileData, validateHeaders } from './utils.ts';
import { corsHeaders, createResponse, handleError } from './utils.ts';

export async function processKeywordFile(fileContent: string) {
  console.log('[process-keywords] Starting file processing');
  
  if (!fileContent) {
    console.error('[process-keywords] No file content provided');
    return createResponse({
      error: { message: 'No file content provided' }
    }, 400);
  }

  // Split the content into lines and process
  const lines = fileContent.split('\n');
  if (lines.length < 2) {
    console.error('[process-keywords] File is empty or has no data rows');
    return createResponse({
      error: { message: 'File is empty or has no data rows' }
    }, 400);
  }

  // Detect delimiter (comma or tab)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  }
  
  const { headers, data } = processFileData(lines, delimiter);
  
  // Validate headers
  const missingColumns = validateHeaders(headers);
  if (missingColumns.length > 0) {
    console.error('[process-keywords] Missing columns:', missingColumns);
    return createResponse({
      error: { message: `Missing columns: ${missingColumns.join(', ')}` }
    }, 400);
  }

  if (data.length === 0) {
    console.error('[process-keywords] No valid data rows found');
    return createResponse({
      error: { message: 'No valid data rows found in file' }
    }, 400);
  }

  console.log('[process-keywords] Processed data rows:', data.length);
  return { data };
}
