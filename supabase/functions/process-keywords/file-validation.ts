
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

// Validate file content
export const validateFileContent = (lines: string[]) => {
  if (!lines || lines.length < 2) {
    console.error('[process-keywords] File is empty or has no data rows');
    return false;
  }
  return true;
};
