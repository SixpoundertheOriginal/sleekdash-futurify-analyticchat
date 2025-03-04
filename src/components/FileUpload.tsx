
import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { useThread } from "@/contexts/ThreadContext";

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { threadId, assistantId } = useThread();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an Excel or CSV file (.xlsx, .xls, .csv)"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload files");
      }

      console.log(`[FileUpload] Processing file: ${file.name}`);
      console.log(`[FileUpload] Using thread ID for file processing: ${threadId}`);
      console.log(`[FileUpload] Using assistant ID for file processing: ${assistantId}`);

      if (!threadId || !assistantId) {
        throw new Error("Thread or assistant ID is missing. Cannot process file.");
      }

      let fileContent = '';
      
      // Process based on file type
      if (file.name.endsWith('.csv')) {
        fileContent = await file.text();
        console.log('[FileUpload] CSV detected, processed text length:', fileContent.length);
      } else {
        // For Excel files
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { 
            type: 'array',
            cellDates: true,
            dateNF: 'YYYY-MM-DD',
            raw: false
          });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          console.log('[FileUpload] Excel sheet name:', firstSheetName);
          
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to CSV with good formatting for dates and numbers
          fileContent = XLSX.utils.sheet_to_csv(worksheet, {
            blankrows: false,
            dateNF: 'YYYY-MM-DD',
            strip: true,
            rawNumbers: false
          });
          
          console.log('[FileUpload] Excel processed to CSV, length:', fileContent.length);
        } catch (excelError) {
          console.error('[FileUpload] Error processing Excel file:', excelError);
          throw new Error(`Error reading Excel file: ${excelError.message}`);
        }
      }

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("File appears to be empty");
      }

      // Check if file content seems valid (has at least header row and one data row)
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error("File must contain a header row and at least one data row");
      }

      console.log('[FileUpload] Processed file lines:', lines.length);
      console.log('[FileUpload] First few rows:', lines.slice(0, 3));

      // Call the Edge Function with file content
      toast({
        title: "Processing file",
        description: "Your file is being analyzed. This may take a moment..."
      });

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'process-keywords',
        {
          body: { 
            fileContent,
            threadId,
            assistantId
          }
        }
      );

      if (functionError) {
        console.error('[FileUpload] Function error:', functionError);
        throw functionError;
      }

      if (!functionData) {
        throw new Error('No data returned from analysis');
      }

      console.log('[FileUpload] Function response:', functionData);

      // Check if there's an OpenAI error in the response
      if (functionData.error) {
        console.error('[FileUpload] OpenAI error:', functionData.error);
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: functionData.error.message || "OpenAI couldn't process this file correctly."
        });
      } else {
        toast({
          title: "Analysis complete",
          description: "Your keywords have been processed successfully."
        });
      }

      // Store the analysis in the database with explicitly specified columns
      const { error: dbError } = await supabase
        .from('keyword_analyses')
        .insert({
          file_name: file.name,
          file_path: file.name,
          prioritized_keywords: functionData.data || [],
          openai_analysis: functionData.analysis || "Analysis could not be completed",
          app_performance: 'Medium',
          created_at: new Date().toISOString(),
          user_id: user.id
        });

      if (dbError) {
        console.error('[FileUpload] Database error:', dbError);
        throw dbError;
      }

    } catch (error) {
      console.error('[FileUpload] Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process the file. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

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
