
import { useState } from "react";
import { Upload } from "lucide-react";

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload logic here
  };

  return (
    <div
      className={`relative h-64 w-full rounded-lg border-2 border-dashed transition-all duration-300 
        ${dragActive ? "border-primary bg-primary/10" : "border-gray-300"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Upload
          className={`h-10 w-10 transition-colors ${
            dragActive ? "text-primary" : "text-gray-400"
          }`}
        />
        <p className="text-sm text-gray-600">
          Drag and drop your files here, or{" "}
          <span className="text-primary cursor-pointer">browse</span>
        </p>
      </div>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        multiple
        onChange={(e) => {
          // Handle file upload logic here
        }}
      />
    </div>
  );
}
