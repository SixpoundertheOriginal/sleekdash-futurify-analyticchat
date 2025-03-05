
import { ProcessedAnalytics } from "../types";

/**
 * Extract title and date range from analysis text
 */
export const extractSummaryInfo = (text: string): Pick<ProcessedAnalytics["summary"], "title" | "dateRange"> => {
  const titleMatch = text.match(/Monthly Performance Report: (.*?)(?:\n|$)/);
  const dateRangeMatch = text.match(/Date Range: (.*?)(?:\n|$)/);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    dateRange: dateRangeMatch ? dateRangeMatch[1].trim() : ""
  };
};

/**
 * Extract executive summary from analysis text
 */
export const extractExecutiveSummary = (text: string): string => {
  const summaryMatch = text.match(/Executive Summary\n(.*?)(?=\n\n)/s);
  return summaryMatch ? summaryMatch[1].trim() : "";
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
