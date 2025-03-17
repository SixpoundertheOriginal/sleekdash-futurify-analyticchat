
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useFileValidation } from '../useFileValidation';

// Mock dependencies
vi.mock('@/utils/file-processing', () => ({
  validateFileType: vi.fn().mockResolvedValue(true)
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

  it('should validate file successfully', async () => {
    const { result } = renderHook(() => useFileValidation());
    
    const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
    
    let isValid;
    await act(async () => {
      isValid = await result.current.validateFile(mockFile);
    });
    
    expect(isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should include all supported formats', () => {
    const { result } = renderHook(() => useFileValidation());
    expect(result.current.supportedFormats).toEqual(['csv', 'excel', 'json', 'text']);
  });
});
