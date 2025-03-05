
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { TestResult } from "./types";

interface TestResultDisplayProps {
  result: TestResult;
}

export function TestResultDisplay({ result }: TestResultDisplayProps) {
  if (!result.status) return null;
  
  return (
    <div className={`p-3 rounded-md flex flex-col gap-2 ${
      result.status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
    }`}>
      <div className="flex items-center gap-2">
        {result.status === "success" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <p>
          {result.status === "success" 
            ? "Thread and Assistant verified successfully!" 
            : "Thread test failed. See details below:"}
        </p>
      </div>
      
      {result.status === "error" && result.details && (
        <div className="mt-2 p-2 bg-black/20 rounded-md overflow-auto text-xs text-white/80 max-h-[150px]">
          <pre>{result.details}</pre>
        </div>
      )}
    </div>
  );
}
