
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/ChatInterface";
import { FileUpload } from "@/components/FileUpload";
import { KeywordAnalytics } from "@/components/KeywordAnalytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDevice } from "@/hooks/use-mobile";
import { Sparkles, Upload, PieChart } from "lucide-react";

interface KeywordsTabsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function KeywordsTabs({ activeTab: externalActiveTab, setActiveTab: externalSetActiveTab }: KeywordsTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("chat");
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  
  // Use either external or internal state management
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalSetActiveTab || setInternalActiveTab;
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full bg-indigo-950/10 p-1">
        <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-indigo-600/20 data-[state=active]:text-white">
          <Sparkles className="h-3.5 w-3.5" />
          AI Chat
        </TabsTrigger>
        <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-indigo-600/20 data-[state=active]:text-white">
          <Upload className="h-3.5 w-3.5" />
          Upload Data
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex items-center gap-2 data-[state=active]:bg-indigo-600/20 data-[state=active]:text-white">
          <PieChart className="h-3.5 w-3.5" />
          Analysis
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="chat" className="pt-4 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          ASO Keywords Research Assistant
        </h3>
        <ChatInterface feature="keywords" />
      </TabsContent>
      
      <TabsContent value="upload" className="pt-4 space-y-6">
        <h3 className="text-xl font-semibold text-white/80 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-indigo-400" />
          Upload Keyword Data
        </h3>
        <Card className="bg-indigo-950/5 border-indigo-500/10">
          <div className="p-4">
            <FileUpload />
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="text-white bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20">
                Download Template
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="analysis" className="pt-4 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-indigo-400" />
          Keyword Performance Analysis
        </h3>
        <KeywordAnalytics />
      </TabsContent>
    </Tabs>
  );
}
