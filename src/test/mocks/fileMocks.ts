
/**
 * Utility functions for mocking files and file operations in tests
 */

/**
 * Creates a mock File object for testing
 */
export function createMockFile(
  name: string = 'test.csv',
  type: string = 'text/csv',
  contents: string = 'test,data\n1,2'
): File {
  const file = new File([contents], name, { type });
  return file;
}

/**
 * Creates mock CSV data for testing
 */
export function createMockCsvData(rows: number = 5): string {
  let csvData = 'keyword,volume,difficulty,cpc\n';
  
  for (let i = 1; i <= rows; i++) {
    csvData += `test keyword ${i},${i * 100},${i * 10},${i * 0.5}\n`;
  }
  
  return csvData;
}

/**
 * Creates mock JSON data for testing
 */
export function createMockJsonData(items: number = 5): string {
  const data = {
    keywords: Array.from({ length: items }, (_, i) => ({
      keyword: `test keyword ${i + 1}`,
      volume: (i + 1) * 100,
      difficulty: (i + 1) * 10,
      cpc: (i + 1) * 0.5
    }))
  };
  
  return JSON.stringify(data);
}

/**
 * Creates mock Excel data (simulated as CSV since we can't create actual Excel files in tests)
 */
export function createMockExcelData(): string {
  return createMockCsvData();
}
