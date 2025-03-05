
import { ProcessedAnalytics } from "../types";

/**
 * Extract title and date range from analysis text
 */
export const extractSummaryInfo = (text: string): Pick<ProcessedAnalytics["summary"], "title" | "dateRange"> => {
  console.log('Extracting summary info from text...');
  
  // Try different formats for title
  const titlePatterns = [
    /Monthly Performance Report: (.*?)(?:\n|$)/,
    /Analysis Report (?:for|of) (.*?)(?:\n|$)/,
    /App Analysis: (.*?)(?:\n|$)/,
    /App Store Analytics: (.*?)(?:\n|$)/
  ];
  
  let title = "";
  for (const pattern of titlePatterns) {
    const titleMatch = text.match(pattern);
    if (titleMatch) {
      title = titleMatch[1].trim();
      console.log('Found title:', title);
      break;
    }
  }
  
  // Try different formats for date range
  const dateRangePatterns = [
    /Date Range: (.*?)(?:\n|$)/,
    /(?:period|time frame) (?:from|of) (.*?)(?:\n|$|:)/,
    /(?:for the|for|during the) (?:period|week) (?:of|from) (.*?)(?:\n|$|:)/,
    /from ((?:January|February|March|April|May|June|July|August|September|October|November|December) \d+) to ((?:January|February|March|April|May|June|July|August|September|October|November|December) \d+)/
  ];
  
  let dateRange = "";
  for (const pattern of dateRangePatterns) {
    const dateRangeMatch = text.match(pattern);
    if (dateRangeMatch) {
      if (dateRangeMatch[2]) {
        // Handle the case with separate month captures
        dateRange = `${dateRangeMatch[1]} to ${dateRangeMatch[2]}`;
      } else {
        dateRange = dateRangeMatch[1].trim();
      }
      console.log('Found date range:', dateRange);
      break;
    }
  }
  
  // Fallback: Check if there's any date range in format Month DD to Month DD
  if (!dateRange) {
    const fallbackDateMatch = text.match(/((?:January|February|March|April|May|June|July|August|September|October|November|December) \d+)\s*(?:to|-)\s*((?:January|February|March|April|May|June|July|August|September|October|November|December) \d+)/i);
    if (fallbackDateMatch) {
      dateRange = `${fallbackDateMatch[1]} to ${fallbackDateMatch[2]}`;
      console.log('Found fallback date range:', dateRange);
    }
  }
  
  return {
    title: title || "App Analytics Report",
    dateRange: dateRange || "Not specified"
  };
};

/**
 * Extract executive summary from analysis text
 */
export const extractExecutiveSummary = (text: string): string => {
  console.log('Extracting executive summary...');
  
  // Try different patterns for executive summary
  const summaryPatterns = [
    /Executive Summary\n(.*?)(?=\n\n|\n###)/s,
    /Summary\s*\n(.*?)(?=\n\n|\n###)/s,
    /1\.\s*Summary\s*\n(.*?)(?=\n\n|\n###|\n2\.)/s
  ];
  
  for (const pattern of summaryPatterns) {
    const summaryMatch = text.match(pattern);
    if (summaryMatch) {
      console.log('Found executive summary with pattern');
      return summaryMatch[1].trim();
    }
  }
  
  // Fallback: Just take first paragraph if nothing else matches
  const firstParagraphMatch = text.match(/(?:\n|^)([^\n]+)(?:\n|$)/);
  if (firstParagraphMatch) {
    console.log('Using first paragraph as summary');
    return firstParagraphMatch[1].trim();
  }
  
  return "No summary available.";
};

/**
 * Helper function to extract numbers and percentages from text
 */
export const extractNumberAndChange = (text: string): { value: number; change: number } => {
  const numberMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
  const changeMatch = text.match(/\(([+-]\d+(?:\.\d+)?)\%\)/);
  
  return {
    value: numberMatch ? parseFloat(numberMatch[1].replace(/,/g, "")) : 0,
    change: changeMatch ? parseFloat(changeMatch[1]) : 0,
  };
};
