
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BarChart, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useThread, DEFAULT_THREAD_ID } from "@/contexts/ThreadContext";

interface AppStoreAnalysisProps {
  initialData: ProcessedAnalytics;
}

export function AppStoreAnalysis({ initialData }: AppStoreAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();
  const { data: processedData, error: processingError, isProcessing } = useAnalysisData(analysisResult);
  
  // Get appStoreAssistantId from context instead of regular assistantId
  const { threadId, appStoreAssistantId } = useThread();

  const handleAnalysis = async () => {
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
      console.log('Submitting app description for analysis:', appDescription.trim());
      console.log('Using thread ID:', threadId);
      console.log('Using App Store assistant ID:', appStoreAssistantId);

      const { data, error } = await supabase.functions.invoke('analyze-app-store', {
        body: { 
          appDescription: appDescription.trim(),
          threadId: threadId,
          assistantId: appStoreAssistantId
        }
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
              disabled={analyzing}
            />
          </div>

          <Button 
            onClick={handleAnalysis}
            disabled={analyzing || !appDescription.trim()}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white transition-colors duration-200 rounded-lg shadow-lg hover:shadow-primary/20"
          >
            {analyzing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Your data is being analyzed...</span>
              </div>
            ) : (
              'Analyze Your Data'
            )}
          </Button>
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
