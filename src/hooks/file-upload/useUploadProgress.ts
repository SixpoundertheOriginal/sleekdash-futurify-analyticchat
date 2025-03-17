
import { useState, useCallback } from "react";

export interface UseUploadProgressReturn {
  uploading: boolean;
  progress: number;
  setUploading: (isUploading: boolean) => void;
  setProgress: (value: number) => void;
  resetProgress: () => void;
}

export function useUploadProgress(): UseUploadProgressReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setUploading(false);
  }, []);

  return {
    uploading,
    progress,
    setUploading,
    setProgress,
    resetProgress
  };
}
