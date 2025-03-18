
/**
 * Extractor for engagement-related metrics
 */
import { ProcessedAnalytics } from "../../types";

/**
 * Extract engagement metrics from raw input
 */
export const extractEngagementMetrics = (rawInput: any, result: Partial<ProcessedAnalytics>) => {
  // Ensure rawInput is a string before attempting to use match
  if (typeof rawInput !== 'string') {
    console.log('Input to extractEngagementMetrics is not a string:', typeof rawInput);
    return result;
  }
  
  // Normalize input - trim whitespace, standardize newlines, and normalize spacing around question marks
  const normalizedInput = rawInput.replace(/\r\n/g, '\n')
                                 .replace(/\s*\?\s*/g, ' ? ')
                                 .trim();
  
  // Initialize engagement object if it doesn't exist
  if (!result.engagement) {
    result.engagement = {
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
  } else {
    // Ensure validation and confidence properties exist
    if (!result.engagement.confidenceScores) {
      result.engagement.confidenceScores = {
        overall: 0,
        sessionsPerDevice: 0,
        retention: 0
      };
    }
    
    if (!result.engagement.validationState) {
      result.engagement.validationState = {
        valid: false,
        warnings: []
      };
    }
  }
  
  // Extract sessions per device with multiple patterns
  const sessionsPatterns = [
    /Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9.]+%)/i,
    /Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)/i,
    /Sessions per (?:Active )?Device\s*\n\s*([0-9,.]+)\s*([+-][0-9.]+%)?/i,
    /Daily Average\s*\n\s*Sessions per (?:Active )?Device:?\s*\??\s*([0-9,.]+)\s*([+-][0-9.]+%)?/i,
    /([0-9,.]+)\s*sessions per (?:active )?device/i
  ];
  
  let sessionsConfidence = 0;
  
  for (const pattern of sessionsPatterns) {
    const match = normalizedInput.match(pattern);
    if (match && match[1]) {
      result.engagement.sessionsPerDevice = {
        value: parseFloat(match[1].replace(/,/g, '')),
        change: match[2] ? parseFloat(match[2]) : 0
      };
      console.log('Extracted sessions per device:', result.engagement.sessionsPerDevice);
      // Higher confidence for patterns with change value
      sessionsConfidence = match[2] ? 90 : 75;
      break;
    }
  }
  
  // Apply range validation for sessions per device (typically between 1-10 for most apps)
  if (result.engagement.sessionsPerDevice.value > 0) {
    if (result.engagement.sessionsPerDevice.value > 20) {
      result.engagement.validationState.warnings.push('Sessions per device value unusually high');
      sessionsConfidence -= 20;
    } else if (result.engagement.sessionsPerDevice.value < 1) {
      result.engagement.validationState.warnings.push('Sessions per device value unusually low');
      sessionsConfidence -= 10;
    }
  } else {
    sessionsConfidence = 0;
  }

  // Extract retention data - look for Average Retention section
  const retentionSection = normalizedInput.match(/Average Retention[\s\S]*?(?=Total Downloads by|$)/i);
  let retentionConfidence = 0;
  let retentionDataPoints = 0;
  
  if (retentionSection) {
    // Day 1 retention with multiple patterns
    const day1Patterns = [
      /Day 1[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 1 Retention[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 1\s*\n\s*(\d+(?:\.\d+)?)%/i,
      /1-day retention[\s\S]*?(\d+(?:\.\d+)?)%/i
    ];
    
    for (const pattern of day1Patterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        result.engagement.retention.day1.value = parseFloat(match[1]);
        console.log('Extracted day 1 retention:', result.engagement.retention.day1.value);
        retentionDataPoints++;
        break;
      }
    }
    
    // Day 7 retention with multiple patterns
    const day7Patterns = [
      /Day 7[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 7 Retention[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 7\s*\n\s*(\d+(?:\.\d+)?)%/i,
      /7-day retention[\s\S]*?(\d+(?:\.\d+)?)%/i
    ];
    
    for (const pattern of day7Patterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        result.engagement.retention.day7.value = parseFloat(match[1]);
        console.log('Extracted day 7 retention:', result.engagement.retention.day7.value);
        retentionDataPoints++;
        break;
      }
    }
    
    // Day 14 retention with multiple patterns (add support for Day 14)
    const day14Patterns = [
      /Day 14[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 14 Retention[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 14\s*\n\s*(\d+(?:\.\d+)?)%/i,
      /14-day retention[\s\S]*?(\d+(?:\.\d+)?)%/i
    ];
    
    for (const pattern of day14Patterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        // Add day14 if it doesn't exist
        if (!result.engagement.retention.day14) {
          result.engagement.retention.day14 = { value: 0, benchmark: 0 };
        }
        result.engagement.retention.day14.value = parseFloat(match[1]);
        console.log('Extracted day 14 retention:', result.engagement.retention.day14.value);
        retentionDataPoints++;
        break;
      }
    }
    
    // Day 28 retention with multiple patterns (add support for Day 28)
    const day28Patterns = [
      /Day 28[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 28 Retention[\s\S]*?(\d+(?:\.\d+)?)%/i,
      /Day 28\s*\n\s*(\d+(?:\.\d+)?)%/i,
      /28-day retention[\s\S]*?(\d+(?:\.\d+)?)%/i
    ];
    
    for (const pattern of day28Patterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1]) {
        // Add day28 if it doesn't exist
        if (!result.engagement.retention.day28) {
          result.engagement.retention.day28 = { value: 0, benchmark: 0 };
        }
        result.engagement.retention.day28.value = parseFloat(match[1]);
        console.log('Extracted day 28 retention:', result.engagement.retention.day28.value);
        retentionDataPoints++;
        break;
      }
    }
  }
  
  // Calculate retention confidence based on data points and cross-validation
  if (retentionDataPoints > 0) {
    retentionConfidence = Math.min(30 + (retentionDataPoints * 20), 95);
    
    // Cross-validate retention metrics (retention should decline over time)
    if (result.engagement.retention.day1.value > 0 && 
        result.engagement.retention.day7.value > 0 && 
        result.engagement.retention.day1.value <= result.engagement.retention.day7.value) {
      result.engagement.validationState.warnings.push('Inconsistent retention values: Day 7 retention higher than Day 1');
      retentionConfidence -= 25;
    }
    
    if (result.engagement.retention.day7.value > 0 && 
        result.engagement.retention.day14 && 
        result.engagement.retention.day14.value > 0 && 
        result.engagement.retention.day7.value <= result.engagement.retention.day14.value) {
      result.engagement.validationState.warnings.push('Inconsistent retention values: Day 14 retention higher than Day 7');
      retentionConfidence -= 25;
    }
    
    if (result.engagement.retention.day14 && 
        result.engagement.retention.day14.value > 0 && 
        result.engagement.retention.day28 && 
        result.engagement.retention.day28.value > 0 && 
        result.engagement.retention.day14.value <= result.engagement.retention.day28.value) {
      result.engagement.validationState.warnings.push('Inconsistent retention values: Day 28 retention higher than Day 14');
      retentionConfidence -= 25;
    }
    
    // Range checks for retention values (typically between 1-100%)
    if (result.engagement.retention.day1.value > 100 || result.engagement.retention.day1.value < 0) {
      result.engagement.validationState.warnings.push('Day 1 retention value out of valid range (0-100%)');
      retentionConfidence -= 30;
    }
    
    if (result.engagement.retention.day7.value > 100 || result.engagement.retention.day7.value < 0) {
      result.engagement.validationState.warnings.push('Day 7 retention value out of valid range (0-100%)');
      retentionConfidence -= 30;
    }
    
    if (result.engagement.retention.day14 && 
        (result.engagement.retention.day14.value > 100 || result.engagement.retention.day14.value < 0)) {
      result.engagement.validationState.warnings.push('Day 14 retention value out of valid range (0-100%)');
      retentionConfidence -= 30;
    }
    
    if (result.engagement.retention.day28 && 
        (result.engagement.retention.day28.value > 100 || result.engagement.retention.day28.value < 0)) {
      result.engagement.validationState.warnings.push('Day 28 retention value out of valid range (0-100%)');
      retentionConfidence -= 30;
    }
  }
  
  // Check for benchmark information in the Benchmarks section
  const benchmarkSection = normalizedInput.match(/Benchmarks[\s\S]*?Retention/i);
  if (benchmarkSection) {
    // Day 1 retention benchmark with multiple patterns
    const day1BenchmarkPatterns = [
      /Day 1 Retention[\s\S]*?Your day 1 retention rate of ([0-9.]+)%[\s\S]*?25th[\s\S]*?~([0-9.]+)%/i,
      /Day 1 Retention[\s\S]*?retention rate of ([0-9.]+)%[\s\S]*?benchmark:?\s*([0-9.]+)%/i,
      /Your day 1 retention rate of ([0-9.]+)%[\s\S]*?industry average:?\s*([0-9.]+)%/i
    ];
    
    for (const pattern of day1BenchmarkPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1] && match[2]) {
        result.engagement.retention.day1.value = parseFloat(match[1]);
        result.engagement.retention.day1.benchmark = parseFloat(match[2]);
        console.log('Extracted day 1 retention from benchmark:', result.engagement.retention.day1);
        // Increase confidence when benchmark is available
        retentionConfidence += 10;
        break;
      }
    }
    
    // Day 7 retention benchmark with multiple patterns
    const day7BenchmarkPatterns = [
      /Day 7 Retention[\s\S]*?Your day 7 retention rate of ([0-9.]+)%[\s\S]*?25th[\s\S]*?~([0-9.]+)%/i,
      /Day 7 Retention[\s\S]*?retention rate of ([0-9.]+)%[\s\S]*?benchmark:?\s*([0-9.]+)%/i,
      /Your day 7 retention rate of ([0-9.]+)%[\s\S]*?industry average:?\s*([0-9.]+)%/i
    ];
    
    for (const pattern of day7BenchmarkPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1] && match[2]) {
        result.engagement.retention.day7.value = parseFloat(match[1]);
        result.engagement.retention.day7.benchmark = parseFloat(match[2]);
        console.log('Extracted day 7 retention from benchmark:', result.engagement.retention.day7);
        // Increase confidence when benchmark is available
        retentionConfidence += 10;
        break;
      }
    }
    
    // Day 28 retention benchmark with multiple patterns
    const day28BenchmarkPatterns = [
      /Day 28 Retention[\s\S]*?Your day 28 retention rate of ([0-9.]+)%[\s\S]*?25th[\s\S]*?~([0-9.]+)%/i,
      /Day 28 Retention[\s\S]*?retention rate of ([0-9.]+)%[\s\S]*?benchmark:?\s*([0-9.]+)%/i,
      /Your day 28 retention rate of ([0-9.]+)%[\s\S]*?industry average:?\s*([0-9.]+)%/i
    ];
    
    for (const pattern of day28BenchmarkPatterns) {
      const match = normalizedInput.match(pattern);
      if (match && match[1] && match[2]) {
        if (!result.engagement.retention.day28) {
          result.engagement.retention.day28 = { value: 0, benchmark: 0 };
        }
        result.engagement.retention.day28.value = parseFloat(match[1]);
        result.engagement.retention.day28.benchmark = parseFloat(match[2]);
        console.log('Extracted day 28 retention from benchmark:', result.engagement.retention.day28);
        // Increase confidence when benchmark is available
        retentionConfidence += 10;
        break;
      }
    }
  }

  // Set confidence scores and validation state
  result.engagement.confidenceScores = {
    overall: Math.round((sessionsConfidence + retentionConfidence) / 2),
    sessionsPerDevice: sessionsConfidence,
    retention: retentionConfidence
  };
  
  result.engagement.validationState.valid = 
    (result.engagement.sessionsPerDevice.value > 0 || result.engagement.retention.day1.value > 0) &&
    result.engagement.validationState.warnings.length < 3 &&
    result.engagement.confidenceScores.overall > 40;
  
  console.log('Engagement metrics validation:', {
    valid: result.engagement.validationState.valid,
    warnings: result.engagement.validationState.warnings,
    confidence: result.engagement.confidenceScores
  });

  return result;
};
