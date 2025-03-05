
import { Upload } from "lucide-react";

interface UploadPlaceholderProps {
  isDragging: boolean;
}

export function UploadPlaceholder({ isDragging }: UploadPlaceholderProps) {
  return (
    <>
      <Upload
        className={`h-10 w-10 transition-colors ${
          isDragging ? "text-primary" : "text-gray-400"
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
  );
}
