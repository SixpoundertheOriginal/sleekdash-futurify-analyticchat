
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

// Detect delimiter in file content
export const detectDelimiter = (firstLine: string): string => {
  return firstLine.includes('\t') ? '\t' : ',';
};
