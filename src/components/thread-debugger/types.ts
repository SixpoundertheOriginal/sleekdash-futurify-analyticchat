
export interface SavedThread {
  id: string;
  name: string;
}

export interface TestResult {
  status: "success" | "error" | null;
  details: string | null;
}
