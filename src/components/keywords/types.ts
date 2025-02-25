
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
