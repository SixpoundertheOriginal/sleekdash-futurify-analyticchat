import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { KeywordAnalytics } from "@/components/KeywordAnalytics";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, HelpCircle, BarChart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const appCategories = [
  "Games",
  "Business",
  "Education",
  "Entertainment",
  "Finance",
  "Health & Fitness",
  "Lifestyle",
  "Medical",
  "Music",
  "Navigation",
  "News",
  "Productivity",
  "Social Networking",
  "Sports",
  "Travel",
  "Utilities",
];

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [appDescription, setAppDescription] = useState("");
  const { toast } = useToast();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="text-white space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                App Store Analytics Dashboard
              </h1>
              <p className="text-white/60">
                Monitor your app's performance and optimize your marketing strategy
              </p>
            </header>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                <BarChart className="h-5 w-5 text-primary" />
                KPI Overview
              </h2>
              <AnalyticsDashboard />
            </div>

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

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                <Sparkles className="h-5 w-5 text-primary" />
                Keywords Analysis & Insights
              </h2>

              <div className="grid gap-6 grid-cols-12">
                <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    Keywords Chat
                    <span className="text-sm font-normal text-white/60">AI-Powered Keywords Assistant</span>
                  </h3>
                  <ChatInterface />
                </div>
                
                <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                  <h3 className="text-xl font-semibold text-white/80 mb-4">Upload Files</h3>
                  <Card className="bg-white/5 border-white/10">
                    <div className="p-4">
                      <FileUpload />
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="text-white bg-white/5 border-white/10">
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <KeywordAnalytics />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
