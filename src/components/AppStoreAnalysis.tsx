
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BarChart, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseMetricsFromAnalysis } from "@/utils/analytics/metrics";
import { parseDeviceDistribution, parseGeographicalData } from "@/utils/analytics/distribution";
import { parseRetentionData } from "@/utils/analytics/retention";
import { useQueryClient } from "@tanstack/react-query";

export function AppStoreAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      setAnalysisResult(null);

      const { data, error } = await supabase.functions.invoke('analyze-app-store', {
        body: { 
          appDescription: appDescription.trim(),
          threadId: 'thread_MDHOcZGZREoIRW3ibVB8pSKc',
          assistantId: 'asst_TfGVD0dcL2vsnPCihybxorC7'
        }
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No response received from the analysis function');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (!data.analysis) {
        throw new Error('No analysis results found in the response');
      }

      // Store analysis results in the database
      const analysisData = {
        performance_metrics: parseMetricsFromAnalysis(data.analysis),
        device_distribution: parseDeviceDistribution(data.analysis),
        geographical_data: parseGeographicalData(data.analysis),
        retention_data: parseRetentionData(data.analysis),
        time_range: 'Last 30 days'
      };

      const { error: insertError } = await supabase
        .from('analysis_results')
        .insert([analysisData]);

      if (insertError) {
        throw insertError;
      }

      // Invalidate queries to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['analysisResults'] });

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
        description: error instanceof Error ? error.message : "Failed to analyze app store data."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-white">AI-Powered App Store Analysis</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="analysis-input" className="text-white">Paste Your Data</Label>
          <Textarea 
            id="analysis-input"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[120px]"
            placeholder="Paste your app store data here to analyze performance metrics, user behavior, and market trends..."
            disabled={analyzing}
          />
        </div>

        <Button 
          onClick={handleAnalysis}
          disabled={analyzing || !appDescription.trim()}
          className="w-full md:w-auto"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Your data is being analyzed...
            </>
          ) : (
            'Analyze Your Data'
          )}
        </Button>

        {analysisResult && (
          <Card className="p-4 mt-4 bg-white/5 border-white/10">
            <h3 className="text-white font-semibold mb-3">Analysis Report</h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-white/90 whitespace-pre-wrap">{analysisResult}</div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}
