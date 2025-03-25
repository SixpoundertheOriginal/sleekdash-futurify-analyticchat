
import { AppStoreMetricsExtractor, parseNumericValue, parsePercentageChange } from '../../utils/analytics/extractors/MetricsExtractor';
import { extractDirectMetrics, extractBaseMetrics } from '../../utils/analytics/offline/directExtraction';

/**
 * Test the AppStoreMetricsExtractor with various inputs
 */
export function testAppStoreExtractor() {
  // Create an instance of the extractor
  const extractor = new AppStoreMetricsExtractor();
  
  // Test basic extraction
  const basicInput = `
    Impressions
    ?
    2.91M
    +30%
    Product Page Views
    ?
    308K
    +3%
    Conversion Rate
    ?
    3.4%
    -5%
    Downloads
    ?
    10,245
    +12%
    Proceeds
    ?
    $52,307
    +8%
  `;
  
  const basicResult = extractor.extract(basicInput);
  console.log('Basic extraction result:', basicResult);
  
  // Test incomplete data
  const incompleteInput = `
    Impressions
    ?
    1.5M
    Downloads
    ?
    5K
  `;
  
  const incompleteResult = extractor.extract(incompleteInput);
  console.log('Incomplete data extraction result:', incompleteResult);
  
  // Test malformed data
  const malformedInput = `
    Impresssions: 2M
    Page Views: 200,000
    Downloads 10K
    Conversion(%) 5
  `;
  
  const malformedResult = extractor.extract(malformedInput);
  console.log('Malformed data extraction result:', malformedResult);
  
  // Test empty data
  const emptyResult = extractor.extract('');
  console.log('Empty data extraction result:', emptyResult);
  
  // Test value parsing
  console.log('Parse 2.5K:', parseNumericValue('2.5K'));
  console.log('Parse 1.2M:', parseNumericValue('1.2M'));
  console.log('Parse 500,000:', parseNumericValue('500,000'));
  console.log('Parse +20%:', parsePercentageChange('+20%'));
  console.log('Parse -5%:', parsePercentageChange('-5%'));
  
  // Test direct extraction
  const directResult = extractDirectMetrics(basicInput);
  console.log('Direct extraction result:', directResult);
  
  // Test base extraction
  const baseResult = extractBaseMetrics(basicInput);
  console.log('Base extraction result:', baseResult);
  
  return {
    basicResult,
    incompleteResult,
    malformedResult,
    emptyResult,
    directResult,
    baseResult
  };
}
