
import { LucideIcon } from "lucide-react";

export interface MetricExtractor {
  patterns: RegExp[];
  aliases?: string[];
  formatter?: (value: number) => string;
  extractValue: (text: string) => number | null;
  calculateFromOthers?: (metrics: Record<string, number | null>) => number | null;
}

export interface ExtractedMetric {
  metric: string;
  value: string;
  change: number;
  icon: LucideIcon;
}

// Normalize value with K/M suffix support
export function normalizeValue(value: string): number {
  if (!value) return NaN;
  
  // Remove commas
  let normalized = value.replace(/,/g, '');
  
  // Handle K/M/B suffixes
  if (/k$/i.test(normalized)) {
    return parseFloat(normalized.slice(0, -1)) * 1000;
  } else if (/m$/i.test(normalized)) {
    return parseFloat(normalized.slice(0, -1)) * 1000000;
  } else if (/b$/i.test(normalized)) {
    return parseFloat(normalized.slice(0, -1)) * 1000000000;
  }
  
  return parseFloat(normalized);
}
