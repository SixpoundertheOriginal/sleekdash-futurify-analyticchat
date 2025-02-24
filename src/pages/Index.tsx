import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, HelpCircle, BarChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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

const mockTrendData = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 72 },
  { month: "Mar", value: 85 },
  { month: "Apr", value: 78 },
  { month: "May", value: 90 },
  { month: "Jun", value: 95 },
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
        description: "Please enter an app description to analyze."
      });
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisResult(null);

      const { data, error } = await supabase.functions.invoke('analyze-app-store', {
        body: { appDescription: appDescription.trim() }
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
                App Store Metadata Generator
              </h1>
              <p className="text-white/60">
                Optimize your app's visibility with data-driven metadata
              </p>
            </header>

            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Basic App Information</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appName" className="text-white">
                      App Name
                    </Label>
                    <span className="text-sm text-white/60">0/30</span>
                  </div>
                  <Input 
                    id="appName" 
                    maxLength={30} 
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="Enter your app name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appCategory" className="text-white flex items-center gap-2">
                    App Category
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-white/60" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose the primary category for your app</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {appCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appDescription" className="text-white">
                      App Description
                    </Label>
                    <span className="text-sm text-white/60">0/4000</span>
                  </div>
                  <Textarea 
                    id="appDescription" 
                    className="bg-white/5 border-white/10 text-white min-h-[120px]" 
                    placeholder="Describe your app's key features and benefits..."
                    maxLength={4000}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-white">Metadata Preview</h2>
                </div>
                <Button variant="outline" size="sm" className="text-white bg-white/5 border-white/10">
                  Generate Metadata
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Keywords</Label>
                    <Card className="p-4 bg-white/5 border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {["productivity", "organization", "tasks", "projects"].map((keyword) => (
                          <span
                            key={keyword}
                            className="px-2 py-1 text-sm rounded-md bg-primary/20 text-primary border border-primary/20"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Keyword Impact Score</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-primary rounded-full" />
                      </div>
                      <span className="text-sm text-white/60">75%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Suggested Improvements</Label>
                    <Card className="p-4 space-y-3 bg-white/5 border-white/10 text-white/80">
                      <p className="text-sm">• Add more specific keywords related to your app's core features</p>
                      <p className="text-sm">• Include localized keywords for major markets</p>
                      <p className="text-sm">• Consider adding trending keywords in your category</p>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 grid-cols-12">
              <Card className="p-6 bg-white/5 border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Keyword Trends</h2>
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px] text-white/80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#9b87f5"
                        strokeWidth={2}
                        dot={{ fill: "#9b87f5" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Competitor Analysis</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Competitor A</span>
                      <span className="text-sm text-white/60">92%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full">
                      <div className="h-full w-[92%] bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Competitor B</span>
                      <span className="text-sm text-white/60">78%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full">
                      <div className="h-full w-[78%] bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Your App</span>
                      <span className="text-sm text-white/60">75%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full">
                      <div className="h-full w-[75%] bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">AI-Powered App Store Analysis</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analysis-input" className="text-white">Enter Your App Description</Label>
                  <Textarea 
                    id="analysis-input"
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    className="bg-white/5 border-white/10 text-white min-h-[120px]"
                    placeholder="Paste your app store data here for AI analysis..."
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
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Description'
                  )}
                </Button>

                {analysisResult && (
                  <Card className="p-4 mt-4 bg-white/5 border-white/10">
                    <h3 className="text-white font-semibold mb-3">Analysis Results</h3>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white/90 whitespace-pre-wrap">{analysisResult}</div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>

            <div className="grid gap-6 grid-cols-12">
              {/* Chat Interface */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  Analytics Chat
                  <span className="text-sm font-normal text-white/60">AI-Powered Insights</span>
                </h2>
                <ChatInterface />
              </div>
              
              {/* File Upload */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <h2 className="text-xl font-semibold text-white/80 mb-4">Upload Files</h2>
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
