
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
    },
    confidenceScores: {
      overall: 0, 
      sessionsPerDevice: 0,
      retention: 0
    },
    validationState: {
      valid: false,
      warnings: []
    }
  };

  console.log('Searching for engagement section...');
  const engagementSection = text.match(/(?:User Engagement|Engagement)(.*?)(?=###|Retention|Acquisition|Financial|Monetization|Technical|Recommendations)/s);
  if (!engagementSection) {
    console.log('Engagement section not found, using whole text');
    // If no specific section, search the whole text
    // Sessions per device
    const sessionsMatch = text.match(/Sessions per (?:Active )?Device:?\s*([\d.]+)\s*\(([+-]\d+)%\)/i);
    if (sessionsMatch) {
      result.sessionsPerDevice = {
        value: parseFloat(sessionsMatch[1]),
        change: parseInt(sessionsMatch[2])
      };
      console.log('Found sessions per device:', result.sessionsPerDevice);
    }
  } else {
    console.log('Found engagement section');
    const metrics = engagementSection[1];

    // Sessions per device
    const sessionsMatch = metrics.match(/Sessions per (?:Active )?Device:?\s*([\d.]+)\s*\(([+-]\d+)%\)/i);
    if (sessionsMatch) {
      result.sessionsPerDevice = {
        value: parseFloat(sessionsMatch[1]),
        change: parseInt(sessionsMatch[2])
      };
      console.log('Found sessions per device:', result.sessionsPerDevice);
    }
  }

  // Look for retention section
  console.log('Searching for retention section...');
  const retentionSection = text.match(/(?:Retention|User Retention)(.*?)(?=###|Engagement|Acquisition|Financial|Monetization|Technical|Recommendations)/s);
  
  if (retentionSection) {
    console.log('Found retention section');
    const metrics = retentionSection[1];

    // Day 1 Retention
    const day1Match = metrics.match(/Day 1 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i);
    if (day1Match) {
      result.retention.day1 = {
        value: parseFloat(day1Match[1]),
        benchmark: parseFloat(day1Match[2])
      };
      console.log('Found day 1 retention:', result.retention.day1);
    }

    // Day 7 Retention
    const day7Match = metrics.match(/Day 7 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i);
    if (day7Match) {
      result.retention.day7 = {
        value: parseFloat(day7Match[1]),
        benchmark: parseFloat(day7Match[2])
      };
      console.log('Found day 7 retention:', result.retention.day7);
    }

    // Day 14 Retention
    const day14Match = metrics.match(/Day 14 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i);
    if (day14Match) {
      result.retention.day14 = {
        value: parseFloat(day14Match[1]),
        benchmark: parseFloat(day14Match[2])
      };
      console.log('Found day 14 retention:', result.retention.day14);
    }

    // Day 28 Retention
    const day28Match = metrics.match(/Day 28 Retention.*?(\d+(?:\.\d+)?)\%.*?(\d+(?:\.\d+)?)\%/i);
    if (day28Match) {
      result.retention.day28 = {
        value: parseFloat(day28Match[1]),
        benchmark: parseFloat(day28Match[2])
      };
      console.log('Found day 28 retention:', result.retention.day28);
    }
  } else {
    console.log('No retention section found');
  }

  return result;
};
