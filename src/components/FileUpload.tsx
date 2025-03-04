import { useState } from "react";
import { Upload } from "lucide-react";
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

      console.log(`[FileUpload] Using thread ID for file processing: ${threadId}`);
      console.log(`[FileUpload] Using assistant ID for file processing: ${assistantId}`);

      let fileContent;
      
      if (file.name.endsWith('.csv')) {
        fileContent = await file.text();
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { 
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: false
        });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        fileContent = XLSX.utils.sheet_to_csv(firstSheet, {
          blankrows: false,
          dateNF: 'YYYY-MM-DD'
        });
      }

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("File appears to be empty");
      }

      console.log('Processed file content length:', fileContent.length);
      console.log('First few rows:', fileContent.split('\n').slice(0, 3));

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'process-keywords',
        {
          body: { 
            fileContent,
            threadId: threadId,
            assistantId: assistantId
          }
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (!functionData) {
        throw new Error('No data returned from analysis');
      }

      console.log('Function response:', functionData);

      toast({
        title: "Analysis complete",
        description: "Your keywords have been processed successfully."
      });

      const analysisData = {
        file_name: file.name,
        file_path: file.name,
        prioritized_keywords: functionData.data,
        openai_analysis: functionData.analysis,
        app_performance: 'Medium',
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      const { error: dbError } = await supabase
        .from('keyword_analyses')
        .insert([analysisData]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

    } catch (error) {
      console.error('Error processing file:', error);
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
        ${uploading ? "opacity-50" : ""}`}
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
        <p className="text-sm text-white/80">
          {uploading ? "Processing..." : (
            <>
              Drag and drop your Excel or CSV file here, or{" "}
              <span className="text-primary cursor-pointer">browse</span>
            </>
          )}
        </p>
        <p className="text-xs text-white/60">
          Supported formats: .xlsx, .xls, .csv
        </p>
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
