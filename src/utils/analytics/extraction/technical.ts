
import { ProcessedAnalytics } from "../types";

/**
 * Extract technical metrics from analysis text
 */
export const extractTechnicalMetrics = (text: string): ProcessedAnalytics["technical"] => {
  const result: ProcessedAnalytics["technical"] = {
    crashes: { value: 0, change: 0 },
    crashRate: { value: 0, percentile: "" }
  };

  console.log('Searching for technical section...');
  const technicalSection = text.match(/(?:Technical Performance|Technical)(.*?)(?=###|Engagement|Acquisition|Financial|Monetization|Retention|Recommendations)/s);
  if (!technicalSection) {
    console.log('Technical section not found, using whole text');
    // If no specific section, search the whole text for crashes
    const crashMatch = text.match(/(?:Crash Count|Crashes):?\s*(\d+)\s*\(([+-]\d+)%\)/i);
    if (crashMatch) {
      result.crashes = {
        value: parseInt(crashMatch[1]),
        change: parseInt(crashMatch[2])
      };
      console.log('Found crashes:', result.crashes);
    } else {
      // Alternative format (e.g., "crashes up by 220%")
      const crashUpMatch = text.match(/crashes up by (\d+)%/i);
      if (crashUpMatch) {
        result.crashes = {
          value: 100, // Default value if not specified
          change: parseInt(crashUpMatch[1])
        };
        console.log('Found crashes up by:', result.crashes);
      } else {
        // Check for other alternative formats
        const crashDownMatch = text.match(/crashes down by (\d+)%/i);
        if (crashDownMatch) {
          result.crashes = {
            value: 100, // Default value if not specified
            change: -parseInt(crashDownMatch[1])
          };
          console.log('Found crashes down by:', result.crashes);
        }
      }
    }

    // Crash Rate
    const crashRateMatch = text.match(/Crash Rate:?\s*([\d.]+)%/i);
    const percentileMatch = text.match(/(\d+)(?:th|st|nd|rd) percentile/i);
    if (crashRateMatch) {
      result.crashRate = {
        value: parseFloat(crashRateMatch[1]),
        percentile: percentileMatch ? percentileMatch[1] : '50th'
      };
      console.log('Found crash rate:', result.crashRate);
    }
  } else {
    console.log('Found technical section');
    const metrics = technicalSection[1];

    // Extract crash count
    const crashMatch = metrics.match(/(?:Crash Count|Crashes):?\s*(\d+)\s*\(([+-]\d+)%\)/i);
    if (crashMatch) {
      result.crashes = {
        value: parseInt(crashMatch[1]),
        change: parseInt(crashMatch[2])
      };
      console.log('Found crashes:', result.crashes);
    } else {
      // Alternative format (e.g., "crashes up by 220%")
      const crashUpMatch = metrics.match(/crashes up by (\d+)%/i);
      if (crashUpMatch) {
        result.crashes = {
          value: 100, // Default value if not specified
          change: parseInt(crashUpMatch[1])
        };
        console.log('Found crashes up by:', result.crashes);
      } else {
        // Check for other alternative formats
        const crashDownMatch = metrics.match(/crashes down by (\d+)%/i);
        if (crashDownMatch) {
          result.crashes = {
            value: 100, // Default value if not specified
            change: -parseInt(crashDownMatch[1])
          };
          console.log('Found crashes down by:', result.crashes);
        }
      }
    }

    // Extract crash rate
    const crashRateMatch = metrics.match(/Crash Rate:?\s*([\d.]+)%/i);
    const percentileMatch = metrics.match(/(\d+)(?:th|st|nd|rd) percentile/i);
    if (crashRateMatch) {
      result.crashRate = {
        value: parseFloat(crashRateMatch[1]),
        percentile: percentileMatch ? percentileMatch[1] : '50th'
      };
      console.log('Found crash rate:', result.crashRate);
    }
  }

  // If crash details are mentioned in the recommendations section
  const recommendationsSection = text.match(/(?:Recommendations)(.*?)(?=###|$)/s);
  if (recommendationsSection) {
    const recMatch = recommendationsSection[1].match(/(?:crashes|crash count) up by (\d+)%/i);
    if (recMatch && result.crashes.value === 0) {
      result.crashes = {
        value: 100, // Default value if not specified
        change: parseInt(recMatch[1])
      };
      console.log('Found crashes in recommendations:', result.crashes);
    }
  }

  return result;
};
