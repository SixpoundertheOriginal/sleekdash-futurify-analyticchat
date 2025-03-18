
# Analytics Extraction Pipeline

This folder contains a unified extraction pipeline for processing and analyzing app analytics data.

## Architecture

The extraction pipeline follows a modular architecture with the following key components:

### 1. BaseExtractor

An interface that defines the contract for all extractors:
- `extract`: Extracts data from input
- `validate`: Optional validation of extracted data

### 2. ExtractionPipeline

A pipeline that coordinates the extraction process:
- Preprocessing of input
- Applying multiple extractors in priority order
- Validation of results
- Performance tracking

### 3. Specialized Extractors

Implementations for specific data sources:
- `AppStoreExtractor`: Extracts metrics from App Store Connect data

### 4. ExtractorService

A facade that simplifies using the pipeline:
- Singleton instance for application-wide use
- Registration of custom extractors
- Processing methods for different data types

## Usage

```typescript
import { extractorService } from './extractors/ExtractorService';

// Process App Store data
const result = extractorService.processAppStoreData(appStoreText);

if (result.success) {
  console.log('Extracted data:', result.data);
} else {
  console.error('Extraction failed:', result.error);
}

// Register a custom extractor
extractorService.registerAppStoreExtractor(myCustomExtractor);
```

## Adding Custom Extractors

To add a new extractor:

1. Implement the `BaseExtractor` interface
2. Register it with the `ExtractorService`

Example:

```typescript
import { BaseExtractor } from './BaseExtractor';
import { ProcessedAnalytics } from '../types';
import { extractorService } from './ExtractorService';

class MyCustomExtractor implements BaseExtractor<ProcessedAnalytics> {
  id = 'my-custom-extractor';
  name = 'My Custom Extractor';
  priority = 50;
  
  extract(input: string): ProcessedAnalytics | null {
    // Custom extraction logic
    // ...
    return result;
  }
  
  validate(result: ProcessedAnalytics): boolean {
    // Custom validation logic
    // ...
    return isValid;
  }
}

// Register with the service
extractorService.registerAppStoreExtractor(new MyCustomExtractor());
```

## Pipeline Configuration

The pipeline can be configured with various options:
- `debug`: Enable detailed logging
- `stopOnFirstSuccess`: Stop after the first successful extraction
- `runValidation`: Whether to validate extracted data
- `trackPerformance`: Measure execution time
