
import { useState } from "react";
import { TestResult } from "../types";

export function useTestResult() {
  const [testResult, setTestResult] = useState<TestResult>({ status: null, details: null });
  
  const clearTestResult = () => {
    setTestResult({ status: null, details: null });
  };
  
  return {
    testResult,
    setTestResult,
    clearTestResult
  };
}
