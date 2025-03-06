
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
    
    // More educational app keywords
    "math games", "spelling games", "science games", "language learning", 
    "abc games", "alphabet learning", "flashcards", "educational activities",
    "learning games", "preschool games", "kindergarten prep", "learning app",
    "homeschool app", "spelling practice", "sight words", "vocabulary builder",
    "early learning", "stem app", "coding for kids", "educational stories",
    
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

/**
 * Generate educational app-specific recommendations based on keyword data
 */
export function generateKeywordRecommendations(keywords: KeywordMetric[]): string[] {
  // Sort keywords by opportunity score
  const keywordWithScores = keywords.map(keyword => ({
    ...keyword,
    opportunityScore: calculateOpportunityScore(keyword)
  }));

  const topOpportunities = [...keywordWithScores]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 15);

  // Extract top keywords
  const topKeywordNames = topOpportunities.map(k => k.keyword);
  
  // Generate AI-like recommendations based on patterns in the data
  const recommendations = [
    `Focus on "${topKeywordNames[0]}" in app title and description - high volume (${topOpportunities[0].volume.toLocaleString()}) with relatively low difficulty (${topOpportunities[0].difficulty}).`,
    
    `Create specialized content for "${topKeywordNames[1]}" to improve organic discovery - relevancy score is ${topOpportunities[1].relevancy}%.`,
    
    `Consider A/B testing app store listings that target "${topKeywordNames[2]}" versus "${topKeywordNames[3]}" to measure conversion impact.`,
    
    `Add "${getEducationalKeyword(topKeywordNames)}" to your app's subtitle for improved educational category ranking.`,
    
    `Develop in-app features around "${getLowCompetitionKeyword(topOpportunities)}" to differentiate from competitors (difficulty only ${getLowCompetitionKeyword(topOpportunities, true)}).`,
    
    `Seasonal opportunity: Update your screenshots to feature "${getHighVolumeKeyword(topOpportunities)}" content (${getHighVolumeKeyword(topOpportunities, true).toLocaleString()} monthly searches).`,
    
    `Your app lacks visibility for "${getRandomKeyword(topKeywordNames)}" compared to competitors - consider content optimization.`,
    
    `The "${getGrowingKeyword(topOpportunities)}" keyword shows ${getGrowingKeyword(topOpportunities, true)}% growth trend - prioritize this in upcoming ASO updates.`,
  ];
  
  return recommendations;
}

// Helper functions for generating realistic recommendations

function getEducationalKeyword(keywords: string[]): string {
  const educationalKeywords = keywords.filter(k => 
    k.includes('learning') || 
    k.includes('educational') || 
    k.includes('teach') || 
    k.includes('school') || 
    k.includes('abc') || 
    k.includes('math') || 
    k.includes('reading') ||
    k.includes('literacy')
  );
  
  return educationalKeywords.length > 0 
    ? educationalKeywords[Math.floor(Math.random() * educationalKeywords.length)] 
    : 'educational learning games';
}

function getLowCompetitionKeyword(keywords: KeywordMetric[], returnDifficulty = false): string | number {
  const lowCompetition = keywords
    .filter(k => k.difficulty < 30 && k.volume > 500)
    .sort((a, b) => a.difficulty - b.difficulty);
  
  if (lowCompetition.length === 0) return returnDifficulty ? 25 : 'educational games';
  
  return returnDifficulty 
    ? lowCompetition[0].difficulty 
    : lowCompetition[0].keyword;
}

function getHighVolumeKeyword(keywords: KeywordMetric[], returnVolume = false): string | number {
  const highVolume = keywords
    .sort((a, b) => b.volume - a.volume);
  
  if (highVolume.length === 0) return returnVolume ? 10000 : 'educational games';
  
  return returnVolume 
    ? highVolume[0].volume 
    : highVolume[0].keyword;
}

function getGrowingKeyword(keywords: KeywordMetric[], returnGrowth = false): string | number {
  const growing = keywords
    .filter(k => k.growth && k.growth > 0)
    .sort((a, b) => (b.growth || 0) - (a.growth || 0));
  
  if (growing.length === 0) return returnGrowth ? 15 : 'learning games';
  
  return returnGrowth 
    ? growing[0].growth || 0
    : growing[0].keyword;
}

function getRandomKeyword(keywords: string[]): string {
  return keywords[Math.floor(Math.random() * keywords.length)];
}

