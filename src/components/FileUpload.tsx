
import { useThread } from "@/contexts/ThreadContext";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useFilePreview } from "@/hooks/useFilePreview";
import { useDragAndDrop } from "@/hooks/file-upload/useDragAndDrop";
import { validateFile } from "@/components/upload/FileValidation";
import { FilePreviewCard } from "@/components/upload/FilePreviewCard";
import { FileErrorState } from "@/components/upload/FileErrorState";
import { UploadPlaceholder } from "@/components/upload/UploadPlaceholder";
import { UploadingState } from "@/components/upload/UploadingState";

export function FileUpload() {
  const { threadId, assistantId } = useThread();
  const { 
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
  } = useFilePreview();
  
  const { dragActive, setDragActive, handleDrag } = useDragAndDrop();
  
  const { uploading, processFile } = useFileUpload(threadId, assistantId);

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
    // Validate the file
    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
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
          <UploadingState />
        ) : filePreview ? (
          <FilePreviewCard
            fileName={filePreview.name}
            fileSize={filePreview.size}
            uploadProgress={uploadProgress}
            onClear={clearFilePreview}
            onProcess={() => handleFileProcess(filePreview as unknown as File)}
            formatFileSize={formatFileSize}
            isUploading={uploading}
          />
        ) : fileError ? (
          <FileErrorState 
            errorMessage={fileError}
            onTryAgain={clearFilePreview}
          />
        ) : (
          <UploadPlaceholder isDragging={dragActive} />
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
