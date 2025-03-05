import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// KPI extraction patterns
const KPI_PATTERNS = {
  impressions: [/impressions[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*impressions/i],
  pageViews: [/page views[:\s]+([0-9,.]+)/i, /product page views[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*page views/i],
  downloads: [/downloads[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*downloads/i, /total downloads[:\s]+([0-9,.]+)/i],
  conversionRate: [/conversion rate[:\s]+([0-9,.]+)%/i, /([0-9,.]+)%[\s]*conversion/i],
  proceeds: [/proceeds[:\s]*\$?([0-9,.]+)/i, /revenue[:\s]*\$?([0-9,.]+)/i, /\$([0-9,.]+)[\s]*proceeds/i],
  crashes: [/crashes?[:\s]+([0-9,.]+)/i, /([0-9,.]+)[\s]*crashes/i, /crash count[:\s]+([0-9,.]+)/i]
};

// Text cleaning function
function cleanText(text: string): string {
  // Remove special characters but keep commas and periods for numbers
  let cleaned = text
    .replace(/[^\w\s.,:%$+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  console.log("Cleaned text:", cleaned);
  return cleaned;
}

// Function to normalize numeric values
function normalizeNumber(numStr: string): number {
  // Remove commas and other formatting
  const normalized = numStr.replace(/,/g, "").trim();
  return parseFloat(normalized);
}

// Extract KPIs from text
function extractKPIs(text: string): Record<string, number | null> {
  const cleanedText = cleanText(text);
  const result: Record<string, number | null> = {};
  
  // Extract each KPI
  for (const [kpi, patterns] of Object.entries(KPI_PATTERNS)) {
    for (const pattern of patterns) {
      const match = cleanedText.match(pattern);
      if (match && match[1]) {
        const value = normalizeNumber(match[1]);
        if (!isNaN(value)) {
          result[kpi] = value;
          break; // Found a match for this KPI, move to next one
        }
      }
    }
    
    // If no match found for this KPI, set to null
    if (result[kpi] === undefined) {
      result[kpi] = null;
    }
  }
  
  return result;
}

// Extract change percentages (e.g., +15%, -3.5%)
function extractChangePercentages(text: string): Record<string, number | null> {
  const cleanedText = cleanText(text);
  const result: Record<string, number | null> = {};
  
  for (const kpi of Object.keys(KPI_PATTERNS)) {
    // Look for patterns like "impressions: 1,234 (+15.2%)" or "impressions increased by 15.2%"
    const patterns = [
      new RegExp(`${kpi}[^\\(]*\\(([+-]?[0-9.]+)%\\)`, 'i'),
      new RegExp(`${kpi}[^\\d]+(increased|decreased) by ([0-9.]+)%`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        if (match[1] === 'increased' || match[1] === 'decreased') {
          // Handle "increased by X%" or "decreased by X%"
          const value = parseFloat(match[2]);
          result[kpi] = match[1] === 'increased' ? value : -value;
        } else {
          // Handle "+X%" or "-X%"
          result[kpi] = parseFloat(match[1]);
        }
        break;
      }
    }
    
    // If no match found for this KPI change, set to null
    if (result[kpi] === undefined) {
      result[kpi] = null;
    }
  }
  
  return result;
}

// Validate the extracted data
function validateData(data: Record<string, number | null>): { 
  isValid: boolean; 
  missingFields: string[];
} {
  const missingFields = Object.entries(data)
    .filter(([_, value]) => value === null)
    .map(([key, _]) => key);
  
  // Consider data valid if we have at least 3 KPIs
  const isValid = Object.values(data).filter(v => v !== null).length >= 3;
  
  return { isValid, missingFields };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { rawText, threadId, assistantId } = await req.json();
    console.log("Received raw text:", rawText.substring(0, 100) + "...");
    console.log("Using thread ID:", threadId);
    console.log("Using assistant ID:", assistantId);

    if (!rawText) {
      return new Response(
        JSON.stringify({ 
          error: "No text provided for processing",
          success: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Extract and normalize KPIs
    const extractedKPIs = extractKPIs(rawText);
    console.log("Extracted KPIs:", extractedKPIs);
    
    // Extract change percentages
    const extractedChanges = extractChangePercentages(rawText);
    console.log("Extracted changes:", extractedChanges);

    // Validate the data
    const validation = validateData(extractedKPIs);
    console.log("Validation result:", validation);

    // Create structured data
    const structuredData = {
      metrics: {
        acquisitionMetrics: {
          impressions: extractedKPIs.impressions,
          pageViews: extractedKPIs.pageViews,
          downloads: extractedKPIs.downloads,
          conversionRate: extractedKPIs.conversionRate
        },
        financialMetrics: {
          proceeds: extractedKPIs.proceeds
        },
        technicalMetrics: {
          crashes: extractedKPIs.crashes
        }
      },
      changes: {
        impressionsChange: extractedChanges.impressions,
        pageViewsChange: extractedChanges.pageViews,
        downloadsChange: extractedChanges.downloads,
        conversionRateChange: extractedChanges.conversionRate,
        proceedsChange: extractedChanges.proceeds,
        crashesChange: extractedChanges.crashes
      },
      validation: {
        isValid: validation.isValid,
        missingFields: validation.missingFields,
        confidence: calculateConfidence(extractedKPIs)
      },
      rawTextLength: rawText.length,
      processedAt: new Date().toISOString()
    };

    // If valid, store in Supabase and send to OpenAI
    if (validation.isValid) {
      // This would be where you store the data in Supabase
      // For now, we'll just log it
      console.log("Valid data extracted, would store in Supabase:", structuredData);
      
      // If thread ID and assistant ID are provided, we could send to OpenAI
      if (threadId && assistantId) {
        console.log("Would send to OpenAI assistant:", assistantId);
        // This is where you would implement the OpenAI call
        // For now, we'll just process the data
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        cleanText: cleanText(rawText),
        message: validation.isValid 
          ? "Data successfully processed and structured" 
          : `Data partially processed. Missing: ${validation.missingFields.join(', ')}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error processing data:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Calculate confidence score based on how many fields we extracted
function calculateConfidence(data: Record<string, number | null>): number {
  const totalFields = Object.keys(data).length;
  const extractedFields = Object.values(data).filter(v => v !== null).length;
  return Math.round((extractedFields / totalFields) * 100);
}
