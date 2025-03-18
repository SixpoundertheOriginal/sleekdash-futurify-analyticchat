
// Validation utilities for processed data

/**
 * Validate extracted data for completeness and confidence
 * @param metrics Extracted metrics
 * @param changes Extracted change percentages
 * @param dateRange Extracted date range
 * @returns Validation result with confidence score
 */
export function validateData(
  metrics: Record<string, any>,
  changes: Record<string, number | null>,
  dateRange: string | null
): { 
  isValid: boolean;
  missingFields: string[];
  confidence: number;
  estimatedFields: string[];
  warnings: string[];
  crossValidation: {
    consistent: boolean;
    issues: string[];
  }
} {
  console.log("Validating extracted data...");
  
  // Check required fields
  const requiredMetrics = ['impressions', 'pageViews', 'downloads', 'conversionRate', 'proceeds'];
  const missingFields: string[] = [];
  const warnings: string[] = [];
  
  for (const field of requiredMetrics) {
    if (metrics[field] === null || metrics[field] === undefined) {
      missingFields.push(field);
      console.log(`Missing required field: ${field}`);
    }
  }
  
  if (!dateRange) {
    missingFields.push('dateRange');
    console.log("Missing required field: dateRange");
  }
  
  // Track which fields we had to estimate
  const estimatedFields: string[] = [];
  for (const [key, value] of Object.entries(metrics)) {
    if (value === null && requiredMetrics.includes(key)) {
      estimatedFields.push(key);
      console.log(`Field needed estimation: ${key}`);
    }
  }
  
  // Calculate confidence score based on missing fields and changes
  let confidence = 100;
  
  // Reduce confidence for missing required fields
  confidence -= missingFields.length * 15;
  
  // Reduce confidence for estimated fields
  confidence -= estimatedFields.length * 10;
  
  // Reduce confidence for missing change percentages
  const missingChanges = Object.values(changes).filter(v => v === null).length;
  confidence -= missingChanges * 5;
  
  // Perform range checks for common metrics
  const rangeChecks = [
    { metric: 'conversionRate', min: 0, max: 100, name: 'Conversion Rate' },
    { metric: 'proceeds', min: 0, max: 1000000000, name: 'Proceeds' },
    { metric: 'downloads', min: 0, max: 100000000, name: 'Downloads' },
    { metric: 'sessionsPerDevice', min: 1, max: 20, name: 'Sessions Per Device' },
    { metric: 'crashRate', min: 0, max: 10, name: 'Crash Rate' }
  ];
  
  for (const check of rangeChecks) {
    if (metrics[check.metric] !== null && metrics[check.metric] !== undefined) {
      const value = metrics[check.metric];
      if (value < check.min) {
        warnings.push(`${check.name} (${value}) is below expected minimum (${check.min})`);
        confidence -= 5;
      } else if (value > check.max) {
        warnings.push(`${check.name} (${value}) is above expected maximum (${check.max})`);
        confidence -= 5;
      }
    }
  }
  
  // Cross-validation between related metrics
  const crossValidationIssues: string[] = [];
  
  // Check 1: Downloads should generally align with impressions * conversion rate
  if (metrics.downloads !== null && metrics.impressions !== null && metrics.conversionRate !== null) {
    const expectedDownloads = metrics.impressions * (metrics.conversionRate / 100);
    const tolerance = 0.5; // 50% tolerance
    const ratio = metrics.downloads / expectedDownloads;
    
    if (ratio < (1 - tolerance) || ratio > (1 + tolerance)) {
      crossValidationIssues.push(`Downloads (${metrics.downloads}) don't align with impressions * conversion rate (${expectedDownloads.toFixed(0)})`);
      confidence -= 10;
    }
  }
  
  // Check 2: Page views should be less than impressions
  if (metrics.pageViews !== null && metrics.impressions !== null && metrics.pageViews > metrics.impressions) {
    crossValidationIssues.push(`Page views (${metrics.pageViews}) exceed impressions (${metrics.impressions})`);
    confidence -= 15;
  }
  
  // Check 3: If we have conversion rate, it should be reasonable for the industry (typically 1-8%)
  if (metrics.conversionRate !== null && (metrics.conversionRate < 0.1 || metrics.conversionRate > 15)) {
    crossValidationIssues.push(`Conversion rate (${metrics.conversionRate}%) outside typical range (0.1-15%)`);
    confidence -= 10;
  }
  
  // Check 4: Proceeds should align with downloads * average revenue per download (if available)
  if (metrics.proceeds !== null && metrics.downloads !== null) {
    const arpd = metrics.proceeds / metrics.downloads;
    if (arpd > 10) {
      crossValidationIssues.push(`Average revenue per download ($${arpd.toFixed(2)}) unusually high`);
      confidence -= 10;
    }
  }
  
  // Check 5: Retention rates should decline over time
  if (metrics.day1Retention !== null && metrics.day7Retention !== null && 
      metrics.day1Retention < metrics.day7Retention) {
    crossValidationIssues.push(`Day 7 retention (${metrics.day7Retention}%) higher than Day 1 (${metrics.day1Retention}%)`);
    confidence -= 10;
  }
  
  if (metrics.day7Retention !== null && metrics.day28Retention !== null && 
      metrics.day7Retention < metrics.day28Retention) {
    crossValidationIssues.push(`Day 28 retention (${metrics.day28Retention}%) higher than Day 7 (${metrics.day7Retention}%)`);
    confidence -= 10;
  }
  
  // Ensure confidence is within 0-100 range
  confidence = Math.max(0, Math.min(100, confidence));
  
  console.log(`Validation confidence: ${confidence}%`);
  console.log(`Cross-validation issues: ${crossValidationIssues.length > 0 ? crossValidationIssues.join(', ') : 'None'}`);
  
  // Data is valid if we have all required metrics or acceptable confidence
  const isValid = missingFields.length === 0 || confidence > 60;
  
  return {
    isValid,
    missingFields,
    confidence,
    estimatedFields,
    warnings,
    crossValidation: {
      consistent: crossValidationIssues.length === 0,
      issues: crossValidationIssues
    }
  };
}

/**
 * Validate specific metric values against expected ranges and relationships
 * @param metricName The metric name
 * @param value The metric value to validate
 * @param relatedMetrics Additional metrics for cross-validation
 * @returns Validation result with confidence and warnings
 */
export function validateMetricValue(
  metricName: string,
  value: number,
  relatedMetrics: Record<string, number> = {}
): {
  valid: boolean;
  confidence: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  let confidence = 85; // Start with high confidence by default
  
  // Define expected ranges for common metrics
  const ranges: Record<string, {min: number, max: number, typical: [number, number]}> = {
    impressions: {min: 100, max: 100000000, typical: [1000, 1000000]},
    pageViews: {min: 10, max: 10000000, typical: [500, 500000]},
    downloads: {min: 0, max: 10000000, typical: [100, 100000]},
    conversionRate: {min: 0.1, max: 15, typical: [1, 8]},
    proceeds: {min: 0, max: 10000000, typical: [100, 100000]},
    sessionsPerDevice: {min: 1, max: 20, typical: [1.5, 8]},
    day1Retention: {min: 1, max: 100, typical: [20, 50]},
    day7Retention: {min: 1, max: 90, typical: [10, 35]},
    day28Retention: {min: 0.5, max: 80, typical: [5, 25]},
    crashRate: {min: 0, max: 10, typical: [0.1, 2]}
  };
  
  // Check if metric is in the defined ranges
  if (ranges[metricName]) {
    const range = ranges[metricName];
    
    // Apply validation rules
    if (value < range.min) {
      warnings.push(`Value below minimum expected range (${range.min})`);
      confidence -= 30;
    } else if (value > range.max) {
      warnings.push(`Value above maximum expected range (${range.max})`);
      confidence -= 30;
    } else if (value < range.typical[0] || value > range.typical[1]) {
      warnings.push(`Value outside typical range (${range.typical[0]}-${range.typical[1]})`);
      confidence -= 15;
    }
  }
  
  // Cross-validate with related metrics based on relationships
  switch (metricName) {
    case 'downloads':
      if (relatedMetrics.pageViews && relatedMetrics.conversionRate) {
        const expectedDownloads = relatedMetrics.pageViews * (relatedMetrics.conversionRate / 100);
        const tolerance = 0.5; // 50% tolerance
        const ratio = value / expectedDownloads;
        
        if (ratio < (1 - tolerance) || ratio > (1 + tolerance)) {
          warnings.push(`Downloads don't align with page views * conversion rate (expected ~${expectedDownloads.toFixed(0)})`);
          confidence -= 20;
        }
      }
      break;
      
    case 'conversionRate':
      if (relatedMetrics.downloads && relatedMetrics.pageViews && relatedMetrics.pageViews > 0) {
        const expectedCvr = (relatedMetrics.downloads / relatedMetrics.pageViews) * 100;
        const tolerance = 0.2; // 20% tolerance
        const diff = Math.abs(value - expectedCvr) / expectedCvr;
        
        if (diff > tolerance) {
          warnings.push(`Conversion rate doesn't align with downloads/page views (expected ~${expectedCvr.toFixed(1)}%)`);
          confidence -= 20;
        }
      }
      break;
      
    case 'proceeds':
      if (relatedMetrics.downloads && relatedMetrics.downloads > 0) {
        const arpd = value / relatedMetrics.downloads;
        if (arpd > 10) {
          warnings.push(`Average revenue per download ($${arpd.toFixed(2)}) unusually high`);
          confidence -= 15;
        } else if (arpd < 0.01 && value > 100) {
          warnings.push(`Average revenue per download ($${arpd.toFixed(3)}) unusually low`);
          confidence -= 10;
        }
      }
      break;
  }
  
  // Ensure confidence is within range
  confidence = Math.max(0, Math.min(100, confidence));
  
  return {
    valid: confidence > 50 && warnings.length < 3,
    confidence,
    warnings
  };
}
