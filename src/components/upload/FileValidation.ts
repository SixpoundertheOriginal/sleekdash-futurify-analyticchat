
export const validateFile = (file: File): string | null => {
  // Validate file type
  const validTypes = ['.xlsx', '.xls', '.csv'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!validTypes.includes(fileExtension)) {
    return `Unsupported file type. Please upload ${validTypes.join(', ')}`;
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return `File is too large. Maximum size is 10MB`;
  }
  
  return null;
}
