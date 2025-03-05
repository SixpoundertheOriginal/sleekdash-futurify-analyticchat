
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BarChart, Loader2, FileText, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useThread } from "@/contexts/ThreadContext";

interface AppStoreAnalysisProps {
  initialData: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [appDescription, setAppDescription] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();
  const { data: processedData, error: processingError, isProcessing } = useAnalysisData(analysisResult);
  
  // Get appStoreAssistantId from context
  const { threadId, appStoreAssistantId } = useThread();

  const handleTextCleaningAndProcessing = async () => {
    if (!appDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please paste your app store data to analyze."
      });
      return;
    }

    try {
      setProcessing(true);
      console.log('Processing app description:', appDescription.substring(0, 100) + "...");
      
      const { data, error } = await supabase.functions.invoke('process-app-data', {
        body: { 
          rawText: appDescription.trim(),
          threadId: threadId,
          assistantId: appStoreAssistantId
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Processing failed');

      setExtractedData(data);
      
      toast({
        title: "Data Processed",
        description: data.message || "Your app store data has been processed.",
        variant: data.data.validation.isValid ? "default" : "destructive"
      });

      // If confidence is low, show a warning but continue
      if (data.data.validation.confidence < 70) {
        toast({
          variant: "warning",
          title: "Low Confidence",
          description: `We're ${data.data.validation.confidence}% confident in the extracted data. Please verify the results.`
        });
      }

      // If the data is valid, proceed with the AI analysis
      if (data.data.validation.isValid) {
        await handleAnalysis(data.data);
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error instanceof Error 
          ? `Failed to process data: ${error.message}`
          : "Failed to process app store data."
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAnalysis = async (processedData?: any) => {
    if (!appDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please paste your app store data to analyze."
      });
      return;
    }

    try {
      setAnalyzing(true);
      console.log('Submitting app description for analysis:', appDescription.substring(0, 100) + "...");
      console.log('Using thread ID:', threadId);
      console.log('Using App Store assistant ID:', appStoreAssistantId);

      // Include any pre-processed data if available
      const dataToSend = processedData 
        ? { 
            appDescription: appDescription.trim(),
            threadId: threadId,
            assistantId: appStoreAssistantId,
            processedData: processedData
          }
        : { 
            appDescription: appDescription.trim(),
            threadId: threadId,
            assistantId: appStoreAssistantId
          };

      const { data, error } = await supabase.functions.invoke('analyze-app-store', {
        body: dataToSend
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Analysis failed');
      if (!data.analysis) throw new Error('No analysis results found');

      setAnalysisResult(data.analysis);
      setAppDescription("");
      toast({
        title: "Analysis Complete",
        description: "Your app store data has been analyzed successfully."
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: error instanceof Error 
          ? `Failed to analyze: ${error.message}`
          : "Failed to analyze app store data."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm shadow-lg transition-all hover:shadow-primary/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-full bg-primary/20">
            <BarChart className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-white">AI-Powered App Store Analysis</h2>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="analysis-input" className="text-white font-medium">Paste Your App Store Data</Label>
            <Textarea 
              id="analysis-input"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[150px] focus:ring-primary/30 transition-all duration-200 rounded-lg"
              placeholder="Paste your app store data here to analyze performance metrics, user behavior, and market trends..."
              disabled={analyzing || processing}
            />
          </div>

          {/* Data extraction status indicator */}
          {extractedData && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex-shrink-0">
                {extractedData.data.validation.isValid ? (
                  <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-white/90">
                  {extractedData.data.validation.isValid
                    ? `Successfully extracted ${Object.keys(extractedData.data.metrics).length} metric categories with ${extractedData.data.validation.confidence}% confidence.`
                    : `Partially processed. Missing data: ${extractedData.data.validation.missingFields.join(', ')}`}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleTextCleaningAndProcessing}
              disabled={processing || analyzing || !appDescription.trim()}
              className="flex-1 bg-primary/90 hover:bg-primary text-white transition-colors duration-200 rounded-lg shadow-lg hover:shadow-primary/20"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing data...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Process & Analyze</span>
                </div>
              )}
            </Button>
            
            <Button 
              onClick={() => handleAnalysis()}
              disabled={analyzing || processing || !appDescription.trim()}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 rounded-lg"
              variant="outline"
            >
              {analyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span>Analyze Only</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative rounded-lg overflow-hidden transition-all duration-300">
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-white font-medium">Processing analytics data...</p>
            </div>
          </div>
        )}
        <AnalyticsDashboard data={processedData || initialData} />
      </div>

      {processingError && (
        <Card className="p-4 bg-rose-500/10 border-rose-500/20 rounded-lg">
          <p className="text-rose-500">Error processing analysis data: {processingError}</p>
        </Card>
      )}

      {analysisResult && (
        <Card className="p-5 mt-4 bg-white/5 border-white/10 backdrop-blur-sm rounded-lg shadow-lg">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            Analysis Report
          </h3>
          <div className="prose prose-invert max-w-none">
            <div className="text-white/90 whitespace-pre-wrap leading-relaxed">{analysisResult}</div>
          </div>
        </Card>
      )}
    </div>
  );
}
