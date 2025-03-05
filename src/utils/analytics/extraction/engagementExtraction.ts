
import { ProcessedAnalytics } from "../types";

/**
 * Extract engagement metrics from analysis text
 */
export const extractEngagementMetrics = (text: string): ProcessedAnalytics["engagement"] => {
  const result: ProcessedAnalytics["engagement"] = {
    sessionsPerDevice: { value: 0, change: 0 },
    retention: {
      day1: { value: 0, benchmark: 0 },
      day7: { value: 0, benchmark: 0 }
    }
  };

  const engagementSection = text.match(/User Engagement & Retention(.*?)(?=###)/s);
  if (!engagementSection) return result;
  
  const metrics = engagementSection[1];

  // Extract sessions per device
  const sessionsMatch = metrics.match(/Sessions per Active Device:\s*([\d.]+)\s*\(([+-]\d+)%\)/);
  if (sessionsMatch) {
    result.sessionsPerDevice = {
      value: parseFloat(sessionsMatch[1]),
      change: parseInt(sessionsMatch[2])
    };
  }

  // Extract retention metrics
  const day1Match = metrics.match(/Day 1 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day1Match) {
    result.retention.day1 = {
      value: parseFloat(day1Match[1]),
      benchmark: parseFloat(day1Match[2])
    };
  }

  const day7Match = metrics.match(/Day 7 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day7Match) {
    result.retention.day7 = {
      value: parseFloat(day7Match[1]),
      benchmark: parseFloat(day7Match[2])
    };
  }

  const day14Match = metrics.match(/Day 14 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day14Match) {
    result.retention.day14 = {
      value: parseFloat(day14Match[1]),
      benchmark: parseFloat(day14Match[2])
    };
  }

  const day28Match = metrics.match(/Day 28 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/);
  if (day28Match) {
    result.retention.day28 = {
      value: parseFloat(day28Match[1]),
      benchmark: parseFloat(day28Match[2])
    };
  }

  return result;
};
