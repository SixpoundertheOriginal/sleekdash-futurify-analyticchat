
import { useState } from "react";
import { TestResult } from "../types";

export interface UseTestResultReturn {
  testResult: TestResult;
  setTestResult: (result: TestResult) => void;
  clearTestResult: () => void;
}

export function useTestResult(): UseTestResultReturn {
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
