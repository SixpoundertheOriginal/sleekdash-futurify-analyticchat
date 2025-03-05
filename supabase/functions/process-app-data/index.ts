
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { extractDateRange } from "./date-extraction.ts";
import { extractMetrics } from "./metrics-extraction.ts";
import { extractChangePercentages, extractRetentionData } from "./change-extraction.ts";
import { validateData } from "./validation.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Process app data function called");
    const { rawText, threadId, assistantId } = await req.json();
    
    if (!rawText) {
      console.error("No text provided for processing");
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
    
    console.log("Received raw text length:", rawText.length);
    console.log("Processing text sample:", rawText.substring(0, 100) + "...");
    
    if (threadId) {
      console.log("Using thread ID:", threadId);
    }
    
    if (assistantId) {
      console.log("Using assistant ID:", assistantId);
    }

    // Extract date range first
    const dateRange = extractDateRange(rawText);
    console.log("Extracted date range:", dateRange);

    // Extract and normalize metrics
    const extractedMetrics = extractMetrics(rawText);
    console.log("Extracted metrics count:", Object.values(extractedMetrics).filter(v => v !== null && v !== undefined).length);
    
    // Extract change percentages
    const extractedChanges = extractChangePercentages(rawText);
    console.log("Extracted changes count:", Object.values(extractedChanges).filter(v => v !== null).length);

    // Extract retention data
    const retentionData = extractRetentionData(rawText);

    // Validate the data
    const validation = validateData(extractedMetrics, extractedChanges, dateRange);
    console.log("Validation result:", validation);

    // Create structured data
    const structuredData = {
      dateRange: dateRange,
      metrics: {
        acquisitionMetrics: {
          impressions: extractedMetrics.impressions,
          pageViews: extractedMetrics.pageViews,
          downloads: extractedMetrics.downloads,
          conversionRate: extractedMetrics.conversionRate
        },
        financialMetrics: {
          proceeds: extractedMetrics.proceeds,
          proceedsPerUser: extractedMetrics.proceedsPerUser
        },
        engagementMetrics: {
          sessionsPerDevice: extractedMetrics.sessionsPerDevice
        },
        technicalMetrics: {
          crashes: extractedMetrics.crashes
        },
        retentionMetrics: retentionData
      },
      changes: {
        impressionsChange: extractedChanges.impressionsChange,
        pageViewsChange: extractedChanges.pageViewsChange,
        downloadsChange: extractedChanges.downloadsChange,
        conversionRateChange: extractedChanges.conversionRateChange,
        proceedsChange: extractedChanges.proceedsChange,
        crashesChange: extractedChanges.crashesChange,
        sessionsPerDeviceChange: extractedChanges.sessionsPerDeviceChange
      },
      validation: {
        isValid: validation.isValid,
        missingFields: validation.missingFields,
        confidence: validation.confidence,
        estimatedFields: validation.estimatedFields
      },
      rawTextLength: rawText.length,
      processedAt: new Date().toISOString()
    };

    // If valid, we could store in Supabase in the future
    if (validation.isValid) {
      console.log("Valid data extracted, could store in Supabase in future implementation");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        cleanText: rawText.substring(0, 500) + "...", // Send partial cleaned text to keep response size reasonable
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
