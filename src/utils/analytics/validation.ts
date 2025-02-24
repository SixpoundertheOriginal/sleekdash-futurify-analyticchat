
export const validateAnalysisText = (analysisText: string): boolean => {
  if (!analysisText) {
    console.log('Analysis text is empty');
    throw new Error('Analysis text is empty');
  }
  
  console.log('Validating analysis text:', analysisText);
  
  // Check for at least two key metrics to confirm it's a performance report
  const keyMetrics = [
    'Total Downloads:',
    'Total Proceeds:',
    'Conversion Rate:',
    'Crash Count:'
  ];
  
  const matchingMetrics = keyMetrics.filter(metric => 
    analysisText.includes(metric)
  );
  
  if (matchingMetrics.length < 2) {
    console.log('Not a performance report - insufficient key metrics');
    throw new Error('Not a performance report - missing key metrics');
  }

  return true;
};
