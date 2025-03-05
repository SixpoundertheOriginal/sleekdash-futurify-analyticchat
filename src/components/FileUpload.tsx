
import { Upload, Loader2, AlertCircle, FileCheck, Info, X } from "lucide-react";
import { useThread } from "@/contexts/ThreadContext";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function FileUpload() {
  const { threadId, assistantId } = useThread();
  const [filePreview, setFilePreview] = useState<{name: string, size: number, type: string} | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    dragActive, 
    uploading, 
    handleDrag, 
    processFile, 
    setDragActive 
  } = useFileUpload(threadId, assistantId);

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileProcess(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
  };

  const handleFileProcess = async (file: File) => {
    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      setFileError(`Unsupported file type. Please upload ${validTypes.join(', ')}`);
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFileError(`File is too large. Maximum size is 10MB`);
      return;
    }
    
    // Show file preview
    setFilePreview({
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Start progress simulation
    const progressInterval = simulateProgress();
    
    try {
      await processFile(file);
      // Complete the progress
      setUploadProgress(100);
      setTimeout(() => {
        setFilePreview(null);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      setFileError('Failed to process file. Please try again.');
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const clearFilePreview = () => {
    setFilePreview(null);
    setFileError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div
      className={`relative h-64 w-full rounded-lg border-2 border-dashed transition-all duration-300 
        ${dragActive ? "border-primary bg-primary/10" : fileError ? "border-red-500 bg-red-500/5" : "border-gray-300"}
        ${uploading ? "opacity-70" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4">
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-white/80">Processing your file...</p>
          </>
        ) : filePreview ? (
          <div className="w-full px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white/90 truncate">{filePreview.name}</p>
                  <p className="text-xs text-white/60">{formatFileSize(filePreview.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full text-white/40 hover:text-white/80"
                onClick={clearFilePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Progress value={uploadProgress} className="h-1.5 mb-3" />
            
            <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
              <Info className="h-4 w-4" />
              <p>File will be processed and analyzed upon submission</p>
            </div>
            
            <Button 
              className="w-full mt-4"
              disabled={uploading || uploadProgress === 100}
              onClick={() => handleFileProcess(filePreview as unknown as File)}
            >
              {uploadProgress === 100 ? 'Uploaded Successfully' : 'Process File'}
            </Button>
          </div>
        ) : fileError ? (
          <>
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-red-400 text-center px-6">{fileError}</p>
            <Button 
              variant="outline" 
              className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={clearFilePreview}
            >
              Try Again
            </Button>
          </>
        ) : (
          <>
            <Upload
              className={`h-10 w-10 transition-colors ${
                dragActive ? "text-primary" : "text-gray-400"
              }`}
            />
            <p className="text-sm text-white/80">
              Drag and drop your Excel or CSV file here, or{" "}
              <span className="text-primary cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-white/60">
              Supported formats: .xlsx, .xls, .csv (Max: 10MB)
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".xlsx,.xls,.csv"
        disabled={uploading}
        onChange={handleFileChange}
      />
    </div>
  );
}
