import React, { useState, useRef } from "react";
import { uploadFile } from "../services/api";
import { Button } from "@/components/ui/button";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false); // For drag UI effect
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection via input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      console.log("✅ File selected:", selectedFile.name);
    }
  };

  // Open file selector manually
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false); // Reset drag state
    console.log("🔥 Drop event fired!");

    if (event.dataTransfer.files.length > 0) {
      const uploadedFile = event.dataTransfer.files[0];
      setFile(uploadedFile);
      console.log("✅ File set in state:", uploadedFile.name);
    } else {
      console.log("❌ No file detected on drop.");
    }
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) {
      setIsDragging(true); // Activate drag effect only if not already set
      console.log("🚀 Dragging over...");
    }
  };

  // Handle drag leave
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    console.log("🚫 Drag left!");
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      console.log("📤 Uploading file:", file.name);
      const result = await uploadFile(file);
      setResponse(JSON.stringify(result, null, 2));
      console.log("✅ Upload successful:", result);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      setResponse("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-slate-800 w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-white">Upload Keywords File</h2>

      {/* Drag-and-Drop Zone */}
      <div 
        className={`w-full p-6 border-2 rounded-lg text-center cursor-pointer transition ${
          isDragging ? "border-blue-500 bg-blue-900" : "border-gray-500 border-dashed"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {file ? (
          <p className="text-white">📂 Selected: {file.name}</p>
        ) : (
          <p className="text-gray-400">Drag and drop your file here or click below</p>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".csv,.xlsx,.txt"
      />

      {/* Select File Button */}
      <Button 
        onClick={handleSelectFile}
        variant="secondary"
        className="w-full"
      >
        {file ? `Selected: ${file.name}` : "Choose File"}
      </Button>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full"
      >
        {loading ? "Uploading..." : "Upload"}
      </Button>

      {/* Response Output */}
      {response && (
        <pre className="w-full p-4 rounded-md text-sm bg-slate-900 text-white overflow-x-auto">
          {response}
        </pre>
      )}
    </div>
  );
};

export default FileUpload;
