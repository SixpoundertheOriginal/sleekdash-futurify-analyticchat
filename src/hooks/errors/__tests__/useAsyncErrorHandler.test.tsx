
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAsyncErrorHandler } from '../useAsyncErrorHandler';

describe('useAsyncErrorHandler', () => {
  const mockHandleError = vi.fn();
  const mockClearError = vi.fn();
  
  beforeEach(() => {
    mockHandleError.mockClear();
    mockClearError.mockClear();
  });

  it('should call clearError when operation starts', async () => {
    const { result } = renderHook(() => 
      useAsyncErrorHandler(mockHandleError, mockClearError)
    );
    
    const successFn = vi.fn().mockResolvedValue('success');
    await result.current.withErrorHandling(successFn);
    
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it('should return result when operation succeeds', async () => {
    const { result } = renderHook(() => 
      useAsyncErrorHandler(mockHandleError, mockClearError)
    );
    
    const successFn = vi.fn().mockResolvedValue('success');
    const response = await result.current.withErrorHandling(successFn);
    
    expect(response).toBe('success');
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it('should call handleError when operation fails', async () => {
    const { result } = renderHook(() => 
      useAsyncErrorHandler(mockHandleError, mockClearError)
    );
    
    const error = new Error('Test error');
    const failingFn = vi.fn().mockRejectedValue(error);
    const context = 'test-context';
    
    const response = await result.current.withErrorHandling(failingFn, context);
    
    expect(response).toBeNull();
    expect(mockHandleError).toHaveBeenCalledWith(error, context);
  });
  
  it('should handle errors with specific context', async () => {
    const { result } = renderHook(() => 
      useAsyncErrorHandler(mockHandleError, mockClearError)
    );
    
    const error = new Error('Operation failed');
    const failingFn = vi.fn().mockRejectedValue(error);
    
    await result.current.withErrorHandling(failingFn, 'file-upload');
    
    expect(mockHandleError).toHaveBeenCalledWith(error, 'file-upload');
  });
  
  it('should handle errors without context', async () => {
    const { result } = renderHook(() => 
      useAsyncErrorHandler(mockHandleError, mockClearError)
    );
    
    const error = new Error('Operation failed');
    const failingFn = vi.fn().mockRejectedValue(error);
    
    await result.current.withErrorHandling(failingFn);
    
    expect(mockHandleError).toHaveBeenCalledWith(error, undefined);
  });
  
  it('should handle non-Error objects', async () => {
    const { result } = renderHook(() => 
      useAsyncErrorHandler(mockHandleError, mockClearError)
    );
    
    const stringError = 'string error';
    const failingFn = vi.fn().mockRejectedValue(stringError);
    
    await result.current.withErrorHandling(failingFn);
    
    expect(mockHandleError).toHaveBeenCalledWith(stringError, undefined);
  });
});
