
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/ChatInterface";
import { FileUpload } from "@/components/FileUpload";
import { KeywordAnalytics } from "@/components/KeywordAnalytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDevice } from "@/hooks/use-mobile";

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
      <TabsList className="grid grid-cols-3 w-full bg-white/5 p-1">
        <TabsTrigger value="chat">AI Chat</TabsTrigger>
        <TabsTrigger value="upload">Upload Data</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
      </TabsList>
      
      <TabsContent value="chat" className="pt-4 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          AI-Powered Keywords Assistant
        </h3>
        <ChatInterface feature="keywords" />
      </TabsContent>
      
      <TabsContent value="upload" className="pt-4 space-y-6">
        <h3 className="text-xl font-semibold text-white/80 mb-4">Upload Keyword Files</h3>
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
      </TabsContent>
      
      <TabsContent value="analysis" className="pt-4 space-y-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Keyword Performance Analysis
        </h3>
        <KeywordAnalytics />
      </TabsContent>
    </Tabs>
  );
}
