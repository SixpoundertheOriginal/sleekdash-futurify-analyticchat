
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileValidation } from '../useFileValidation';
import { createMockFile } from '@/test/mocks/fileMocks';

// Mock dependencies
vi.mock('@/utils/file-processing', () => ({
  validateFileType: vi.fn().mockImplementation((file) => {
    // Only mock CSV and Excel files as valid
    const name = file.name.toLowerCase();
    return Promise.resolve(name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls'));
  })
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useFileValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null error', () => {
    const { result } = renderHook(() => useFileValidation());
    expect(result.current.error).toBeNull();
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useFileValidation());
    
    act(() => {
      result.current.setError('Test error');
    });
    
    expect(result.current.error).toBe('Test error');
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should validate file successfully for CSV', async () => {
    const { result } = renderHook(() => useFileValidation());
    
    const mockFile = createMockFile('test.csv', 'text/csv');
    
    let isValid;
    await act(async () => {
      isValid = await result.current.validateFile(mockFile);
    });
    
    expect(isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });
  
  it('should validate file successfully for Excel', async () => {
    const { result } = renderHook(() => useFileValidation());
    
    const mockFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    let isValid;
    await act(async () => {
      isValid = await result.current.validateFile(mockFile);
    });
    
    expect(isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });
  
  it('should reject invalid file types', async () => {
    const { result } = renderHook(() => useFileValidation());
    
    const mockFile = createMockFile('test.pdf', 'application/pdf');
    
    let isValid;
    await act(async () => {
      isValid = await result.current.validateFile(mockFile);
    });
    
    expect(isValid).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain('Invalid file type');
  });

  it('should include all supported formats', () => {
    const { result } = renderHook(() => useFileValidation());
    expect(result.current.supportedFormats).toEqual(['csv', 'excel', 'json', 'text']);
  });
  
  it('should set custom error message', () => {
    const { result } = renderHook(() => useFileValidation());
    
    act(() => {
      result.current.setError('Custom error message');
    });
    
    expect(result.current.error).toBe('Custom error message');
  });
});
