
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BarChart, Loader2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useThread } from "@/contexts/ThreadContext";

interface AppStoreFormProps {
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  isProcessing: boolean;
  isAnalyzing: boolean;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
}

export function AppStoreForm({
  onProcessSuccess,
  onAnalysisSuccess,
  isProcessing,
  isAnalyzing,
  setProcessing,
  setAnalyzing
}: AppStoreFormProps) {
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();
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

      onProcessSuccess(data);
      
      toast({
        title: "Data Processed",
        description: data.message || "Your app store data has been processed.",
        variant: data.data.validation.isValid ? "default" : "destructive"
      });

      // If confidence is low, show a warning but continue
      if (data.data.validation.confidence < 70) {
        toast({
          variant: "default",
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

      onAnalysisSuccess(data.analysis);
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
            disabled={isAnalyzing || isProcessing}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleTextCleaningAndProcessing}
            disabled={isProcessing || isAnalyzing || !appDescription.trim()}
            className="flex-1 bg-primary/90 hover:bg-primary text-white transition-colors duration-200 rounded-lg shadow-lg hover:shadow-primary/20"
          >
            {isProcessing ? (
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
            disabled={isAnalyzing || isProcessing || !appDescription.trim()}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 rounded-lg"
            variant="outline"
          >
            {isAnalyzing ? (
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
  );
}
