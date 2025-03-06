
import { KeywordMetric } from '@/components/keywords/types';
import { calculateOpportunityScore } from './opportunity-score';

/**
 * Generates realistic dummy keyword data for demos and presentations
 */
export function generateDummyKeywordData(count = 30): KeywordMetric[] {
  // Sample app-related keywords
  const baseKeywords = [
    // Reading/educational app keywords
    "reading app", "kids reading app", "learn to read", "reading games for kids",
    "educational games", "phonics app", "interactive reading", "children's books app",
    "learning to read games", "literacy app", "reading tutor app", "free reading app",
    
    // Gaming app keywords
    "puzzle games", "adventure games", "casual games", "free games", 
    "offline games", "strategy games", "brain games", "kids games",
    
    // Productivity app keywords
    "to do list", "note taking", "calendar app", "productivity tools",
    "task management", "planner app", "reminder app", "organization app",
    
    // Modifiers
    "free", "premium", "for kids", "best", "top rated", "new", "2024",
    "offline", "online", "multiplayer", "educational", "fun", "easy"
  ];
  
  // Generate compound keywords
  const keywords: KeywordMetric[] = [];
  
  // Helper to get random integer in range
  const randomInt = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Generate the requested number of keywords
  for (let i = 0; i < count; i++) {
    // For some keywords, combine two base keywords or add a modifier
    let keyword: string;
    const rand = Math.random();
    
    if (rand < 0.4) {
      // Pick a single keyword
      keyword = baseKeywords[randomInt(0, baseKeywords.length - 1)];
    } else if (rand < 0.7) {
      // Combine with a modifier
      const base = baseKeywords[randomInt(0, baseKeywords.length - 8)]; // Skip modifiers
      const modifier = baseKeywords[randomInt(baseKeywords.length - 8, baseKeywords.length - 1)];
      keyword = `${modifier} ${base}`;
    } else {
      // Combine two non-modifier keywords
      const first = baseKeywords[randomInt(0, baseKeywords.length - 8)]; // Skip modifiers
      const second = baseKeywords[randomInt(0, baseKeywords.length - 8)]; // Skip modifiers
      keyword = `${first} ${second}`;
    }
    
    // Generate realistic metrics
    const volume = randomInt(100, 50000);
    const difficulty = randomInt(10, 70);
    const relevancy = randomInt(50, 100);
    const chance = Math.max(0, 100 - difficulty * 1.2); // Inverse correlation with difficulty
    const kei = parseFloat((volume / Math.pow(difficulty, 2) * relevancy / 10).toFixed(1));
    const growth = randomInt(-10, 30);
    
    keywords.push({
      keyword,
      volume,
      difficulty,
      kei,
      relevancy,
      chance,
      growth
    });
  }
  
  return keywords;
}

/**
 * Generates processed keyword data with opportunity scores
 */
export function generateProcessedDummyData(count = 30) {
  const keywords = generateDummyKeywordData(count);
  
  return keywords.map(keyword => {
    return {
      ...keyword,
      opportunityScore: calculateOpportunityScore(keyword)
    };
  });
}
