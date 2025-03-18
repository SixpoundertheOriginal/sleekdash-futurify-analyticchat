
import { BaseExtractor, ExtractionResult } from './BaseExtractor';
import { ProcessedAnalytics } from '../types';

/**
 * Extractor for keyword-related data from App Store
 */
export class KeywordExtractor implements BaseExtractor<ProcessedAnalytics> {
  id = 'keyword-extractor';
  name = 'Keyword Data Extractor';
  priority = 80; // Lower priority than the main AppStore extractor
  
  private patterns = {
    keywords: [
      /Top keywords:?\s*(.+?)(?:\n\n|\n(?=[A-Z]))/is,
      /Popular search terms:?\s*(.+?)(?:\n\n|\n(?=[A-Z]))/is,
      /Keywords:?\s*(.+?)(?:\n\n|\n(?=[A-Z]))/is
    ],
    singleKeyword: /([a-zA-Z0-9\s-]+)(?:\s*:\s*(\d+))?/g,
    keywordVolume: /volume[:\s]+(\d+)/i,
    keywordDifficulty: /difficulty[:\s]+(\d+)/i
  };
  
  /**
   * Extract keyword data from App Store text
   */
  extract(input: string): ProcessedAnalytics | null {
    try {
      if (!input || typeof input !== 'string') {
        console.log('[KeywordExtractor] Invalid input: not a string or empty');
        return null;
      }
      
      // Create base result structure with default values
      const result: ProcessedAnalytics = {
        summary: {
          title: "App Store Keyword Analytics",
          dateRange: "",
          executiveSummary: ""
        },
        acquisition: {
          impressions: { value: 0, change: 0 },
          pageViews: { value: 0, change: 0 },
          conversionRate: { value: 0, change: 0 },
          downloads: { value: 0, change: 0 },
          funnelMetrics: {
            impressionsToViews: 0,
            viewsToDownloads: 0
          }
        },
        financial: {
          proceeds: { value: 0, change: 0 },
          proceedsPerUser: { value: 0, change: 0 },
          derivedMetrics: {
            arpd: 0,
            revenuePerImpression: 0,
            monetizationEfficiency: 0,
            payingUserPercentage: 0
          }
        },
        engagement: {
          sessionsPerDevice: { value: 0, change: 0 },
          retention: {
            day1: { value: 0, benchmark: 0 },
            day7: { value: 0, benchmark: 0 }
          }
        },
        technical: {
          crashes: { value: 0, change: 0 },
          crashRate: { value: 0, percentile: "" }
        },
        geographical: {
          markets: [],
          devices: [],
          sources: []
        },
        keywords: {
          terms: []
        }
      };
      
      // Extract keyword section
      let keywordSection: string | null = null;
      for (const pattern of this.patterns.keywords) {
        const match = input.match(pattern);
        if (match && match[1]) {
          keywordSection = match[1].trim();
          break;
        }
      }
      
      if (!keywordSection) {
        console.log('[KeywordExtractor] No keyword section found in input');
        return null;
      }
      
      // Extract individual keywords
      let keywordMatch;
      const keywordsMap = new Map();
      
      while ((keywordMatch = this.patterns.singleKeyword.exec(keywordSection)) !== null) {
        const keyword = keywordMatch[1]?.trim();
        const volume = keywordMatch[2] ? parseInt(keywordMatch[2], 10) : null;
        
        if (keyword && keyword.length > 1) { // Avoid single chars
          keywordsMap.set(keyword, {
            keyword,
            volume: volume || this.estimateVolume(keyword, keywordSection),
            difficulty: this.estimateDifficulty(keyword, keywordSection)
          });
        }
      }
      
      // Convert to array and sort by volume (highest first)
      const keywordTerms = Array.from(keywordsMap.values())
        .filter(term => term.keyword.length > 1 && !['and', 'the', 'for'].includes(term.keyword.toLowerCase()))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      
      // Add to result
      result.keywords = {
        terms: keywordTerms.slice(0, 20) // Limit to top 20 keywords
      };
      
      // Check if we have enough keywords to consider this valid
      if (result.keywords.terms.length < 3) {
        console.log('[KeywordExtractor] Not enough keywords found to consider valid');
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('[KeywordExtractor] Error extracting keywords:', error);
      return null;
    }
  }
  
  /**
   * Estimate keyword volume if not directly available
   */
  private estimateVolume(keyword: string, context: string): number {
    // Try to find explicit volume info for this keyword
    const volumePattern = new RegExp(`${keyword}[\\s\\w]*volume[:\\s]+(\\d+)`, 'i');
    const match = context.match(volumePattern);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // If no explicit volume, apply a heuristic based on keyword position
    // (keywords mentioned earlier in the list tend to be more important)
    const position = context.indexOf(keyword);
    const normalizedPosition = Math.max(0, 1 - position / context.length);
    
    // Base volume between 10-1000 based on position
    return Math.round(10 + normalizedPosition * 990);
  }
  
  /**
   * Estimate keyword difficulty if not directly available
   */
  private estimateDifficulty(keyword: string, context: string): number {
    // Try to find explicit difficulty info
    const difficultyPattern = new RegExp(`${keyword}[\\s\\w]*difficulty[:\\s]+(\\d+)`, 'i');
    const match = context.match(difficultyPattern);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // If no explicit difficulty, estimate based on word length and frequency
    // (longer and more frequently mentioned keywords tend to be more competitive)
    const wordCount = keyword.split(/\s+/).length;
    const frequency = (context.match(new RegExp(keyword, 'ig')) || []).length;
    
    // Base difficulty between 20-80 based on word count and frequency
    return Math.min(80, Math.max(20, wordCount * 10 + frequency * 5));
  }
  
  /**
   * Validate the extracted data
   */
  validate(result: ProcessedAnalytics): boolean {
    // Ensure we have at least some keywords
    return result.keywords?.terms && result.keywords.terms.length > 0;
  }
}
