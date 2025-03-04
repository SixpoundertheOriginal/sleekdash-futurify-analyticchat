
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create a response with CORS headers
export const createResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status 
    }
  );
};

// Helper function to handle errors
export const handleError = (error: any, context: string) => {
  console.error(`[process-keywords] ${context}:`, error);
  return createResponse({ 
    error: { message: `${context}: ${error instanceof Error ? error.message : String(error)}` }
  }, 500);
};

// Process file data into structured format
export const processFileData = (lines: string[], delimiter: string) => {
  const headers = lines[0].split(delimiter).map(h => h.trim());
  console.log('[process-keywords] Found headers:', headers);
  
  // Convert file content to structured data
  const data = lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(delimiter);
      const result = {};
      
      // Only add fields that have values
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        if (value) {
          result[header] = value;
        }
      });
      
      return result;
    })
    .filter(row => Object.keys(row).length > 0); // Remove empty rows
    
  return { headers, data };
};

// Validate headers against expected columns
export const validateHeaders = (headers: string[]) => {
  const expectedColumns = [
    "Keyword", "Volume", "Max Reach", "Results", "Difficulty",
    "Chance", "KEI", "Relevancy", "Rank", "Growth"
  ];

  // Make the column check case-insensitive
  const headerMap = new Map(
    headers.map(h => [h.trim().toLowerCase(), h.trim()])
  );
  const missingColumns = expectedColumns.filter(col => 
    !headerMap.has(col.toLowerCase())
  );

  return missingColumns;
};
