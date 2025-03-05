
/**
 * Calculate opportunity score for a keyword
 * Opportunity score considers volume, difficulty, relevancy and other factors
 * to determine how valuable a keyword is
 */
import { KeywordMetric } from '@/components/keywords/types';

export function calculateOpportunityScore(keyword: KeywordMetric): number {
  // Simple formula: volume * (100 - difficulty) * (relevancy / 100) / 100
  const volume = keyword.volume || 0;
  const difficulty = keyword.difficulty || 0;
  const relevancy = keyword.relevancy || 0;
  
  // Base score calculation
  let score = (volume * (100 - difficulty) * (relevancy / 100)) / 100;
  
  // Normalize score to 0-100 range
  score = Math.min(100, Math.max(0, score / 10));
  
  return score;
}
