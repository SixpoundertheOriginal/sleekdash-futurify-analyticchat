
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { TestResult } from "./types";
import { ErrorDisplay } from "@/components/app-store/ErrorDisplay";

interface TestResultDisplayProps {
  result: TestResult;
  onRetry?: () => void;
}

export function TestResultDisplay({ result, onRetry }: TestResultDisplayProps) {
  if (!result.status) return null;
  
  if (result.status === "success") {
    return (
      <div className="p-3 rounded-md flex flex-col gap-2 bg-green-500/20 text-green-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <p>Thread and Assistant verified successfully!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 rounded-md flex flex-col gap-2 bg-red-500/20 text-red-400">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4" />
        <p>Thread test failed. See details below:</p>
      </div>
      
      {result.details && (
        <div className="mt-2 p-2 bg-black/20 rounded-md overflow-auto text-xs text-white/80 max-h-[150px]">
          <pre>{result.details}</pre>
        </div>
      )}
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-3 py-1 mt-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md text-sm transition-colors self-start"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
