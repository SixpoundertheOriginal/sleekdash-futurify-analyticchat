
import { useState, useRef } from "react";

export interface FilePreviewProps {
  name: string;
  size: number;
  type: string;
}

export interface UseFilePreviewReturn {
  filePreview: FilePreviewProps | null;
  setFilePreview: (preview: FilePreviewProps | null) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  fileError: string | null;
  setFileError: (error: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  clearFilePreview: () => void;
  simulateProgress: () => NodeJS.Timeout;
  formatFileSize: (bytes: number) => string;
}

export function useFilePreview(): UseFilePreviewReturn {
  const [filePreview, setFilePreview] = useState<FilePreviewProps | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFilePreview = () => {
    setFilePreview(null);
    setFileError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simulate progress for UX
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        // Simulate slower progress toward the end
        const increment = prev < 70 ? 10 : (prev < 90 ? 3 : 1);
        const newProgress = Math.min(prev + increment, 95);
        
        if (newProgress === 95) clearInterval(interval);
        return newProgress;
      });
    }, 400);
    
    return interval;
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return {
    filePreview,
    setFilePreview,
    uploadProgress,
    setUploadProgress,
    fileError,
    setFileError,
    fileInputRef,
    clearFilePreview,
    simulateProgress,
    formatFileSize
  };
}
