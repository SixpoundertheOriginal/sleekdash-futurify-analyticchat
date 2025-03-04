
import { Upload, Loader2 } from "lucide-react";
import { useThread } from "@/contexts/ThreadContext";
import { useFileUpload } from "@/hooks/useFileUpload";

export function FileUpload() {
  const { threadId, assistantId } = useThread();
  const { 
    dragActive, 
    uploading, 
    handleDrag, 
    processFile, 
    setDragActive 
  } = useFileUpload(threadId, assistantId);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div
      className={`relative h-64 w-full rounded-lg border-2 border-dashed transition-all duration-300 
        ${dragActive ? "border-primary bg-primary/10" : "border-gray-300"}
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
              Supported formats: .xlsx, .xls, .csv
            </p>
          </>
        )}
      </div>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".xlsx,.xls,.csv"
        disabled={uploading}
        onChange={handleFileChange}
      />
    </div>
  );
}
