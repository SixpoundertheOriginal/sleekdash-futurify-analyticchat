
import { X, FileCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FilePreviewCardProps {
  fileName: string;
  fileSize: number;
  uploadProgress: number;
  onClear: () => void;
  onProcess: () => void;
  formatFileSize: (bytes: number) => string;
  isUploading: boolean;
}

export function FilePreviewCard({
  fileName,
  fileSize,
  uploadProgress,
  onClear,
  onProcess,
  formatFileSize,
  isUploading
}: FilePreviewCardProps) {
  return (
    <div className="w-full px-6 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white/90 truncate">{fileName}</p>
            <p className="text-xs text-white/60">{formatFileSize(fileSize)}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full text-white/40 hover:text-white/80"
          onClick={onClear}
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
        disabled={isUploading || uploadProgress === 100}
        onClick={onProcess}
      >
        {uploadProgress === 100 ? 'Uploaded Successfully' : 'Process File'}
      </Button>
    </div>
  );
}
