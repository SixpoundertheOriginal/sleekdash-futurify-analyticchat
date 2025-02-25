
export const validateAnalysisText = (analysisText: string): boolean => {
  if (!analysisText) {
    console.log('Analysis text is empty');
    throw new Error('Analysis text is empty');
  }
  
  console.log('Validating analysis text:', analysisText);
  
  // Check if this is a keyword analysis
  const keywordIndicators = [
    /keyword (analysis|data|metrics|trends)/i,
    /seo (analysis|insights)/i,
    /search volume/i,
    /keyword difficulty/i,
    /ranking opportunities/i,
    /relevancy scores?/i,
    /optimization recommendations?/i
  ];

  // Check if this is a performance report
  const performanceIndicators = [
    /total downloads:?\s*[\d,.k]+/i,
    /downloads:?\s*[\d,.k]+/i,
    /\b[\d,.k]+ downloads\b/i,
    /total proceeds:?\s*\$?[\d,.k]+/i,
    /proceeds:?\s*\$?[\d,.k]+/i,
    /revenue:?\s*\$?[\d,.k]+/i,
    /performance (report|analysis)/i,
    /monthly (report|analysis)/i,
    /key metrics/i,
    /user acquisition/i,
    /financial performance/i
  ];
  
  // Count matches for each type of analysis
  const keywordMatchCount = keywordIndicators.filter(pattern => 
    pattern.test(analysisText)
  ).length;

  const performanceMatchCount = performanceIndicators.filter(pattern => 
    pattern.test(analysisText)
  ).length;

  // Validate based on the type of analysis
  if (keywordMatchCount >= 2) {
    console.log('Valid keyword analysis found');
    return true;
  }
  
  if (performanceMatchCount >= 2) {
    console.log('Valid performance report found');
    return true;
  }

  console.log('Invalid analysis - insufficient indicators found');
  throw new Error('Not a valid analysis report - missing required indicators');
};
