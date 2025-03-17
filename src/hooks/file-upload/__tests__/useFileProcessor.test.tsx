
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useFileProcessor } from '../useFileProcessor';
import { createMockFile, createMockCsvData, createMockJsonData } from '@/test/mocks/fileMocks';

// Mock dependencies
vi.mock('@/utils/file-processing', () => ({
  processExcelFile: vi.fn().mockImplementation(() => {
    return Promise.resolve('header1,header2\nvalue1,value2');
  }),
  validateFileContent: vi.fn().mockResolvedValue(true)
}));

vi.mock('@/utils/data-processing/DataProcessingService', () => ({
  processData: vi.fn().mockImplementation((content, options) => {
    return {
      success: true,
      format: options.formatHint,
      data: { sample: 'data' }
    };
  }),
  DataFormat: ['csv', 'excel', 'json', 'text']
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useFileProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the file.text() method
    global.File.prototype.text = vi.fn().mockImplementation(function() {
      // Use the first item in the constructor as the file contents
      return Promise.resolve(this.size > 0 ? 'mocked file content' : '');
    });
    
    // Reset console.error and console.log to prevent test noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should process CSV file correctly', async () => {
    const { result } = renderHook(() => useFileProcessor());
    
    const csvData = createMockCsvData();
    const csvFile = createMockFile('test.csv', 'text/csv', csvData);
    
    // Override the text method for this specific file
    csvFile.text = vi.fn().mockResolvedValue(csvData);
    
    const processingResult = await result.current.processFileContent(csvFile);
    
    expect(processingResult).not.toBeNull();
    expect(processingResult?.format).toBe('csv');
    expect(processingResult?.success).toBe(true);
  });
  
  it('should process Excel file correctly', async () => {
    const { result } = renderHook(() => useFileProcessor());
    
    const excelFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const processingResult = await result.current.processFileContent(excelFile);
    
    expect(processingResult).not.toBeNull();
    expect(processingResult?.format).toBe('excel');
    expect(processingResult?.success).toBe(true);
  });
  
  it('should process JSON file correctly', async () => {
    const { result } = renderHook(() => useFileProcessor());
    
    const jsonData = createMockJsonData();
    const jsonFile = createMockFile('test.json', 'application/json', jsonData);
    
    // Override the text method for this specific file
    jsonFile.text = vi.fn().mockResolvedValue(jsonData);
    
    const processingResult = await result.current.processFileContent(jsonFile);
    
    expect(processingResult).not.toBeNull();
    expect(processingResult?.format).toBe('json');
    expect(processingResult?.success).toBe(true);
  });
  
  it('should process text file as default format', async () => {
    const { result } = renderHook(() => useFileProcessor());
    
    const textFile = createMockFile('test.txt', 'text/plain', 'Sample text content');
    
    // Override the text method for this specific file
    textFile.text = vi.fn().mockResolvedValue('Sample text content');
    
    const processingResult = await result.current.processFileContent(textFile);
    
    expect(processingResult).not.toBeNull();
    expect(processingResult?.format).toBe('text');
    expect(processingResult?.success).toBe(true);
  });
  
  it('should return null when processing fails', async () => {
    const { result } = renderHook(() => useFileProcessor());
    
    // Mock implementation of processData to simulate failure
    const processDataMock = vi.requireMock('@/utils/data-processing/DataProcessingService').processData;
    processDataMock.mockReturnValueOnce({
      success: false,
      error: 'Processing failed'
    });
    
    const csvFile = createMockFile('test.csv', 'text/csv');
    
    const processingResult = await result.current.processFileContent(csvFile);
    
    expect(processingResult).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
