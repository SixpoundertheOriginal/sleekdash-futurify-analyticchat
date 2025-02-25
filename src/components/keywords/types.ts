
export interface KeywordMetric {
  keyword: string;
  volume: number;
  difficulty: number;
  kei: number;
  relevancy: number;
  chance: number;
  growth: number;
}

export interface ProcessedKeywordData extends KeywordMetric {
  opportunityScore: number;
}

export interface AnalysisError {
  message: string;
  code?: string;
  details?: string;
}

export interface KeywordAnalysis {
  data: ProcessedKeywordData[];
  error: AnalysisError | null;
  isLoading: boolean;
  timestamp?: string;
}
