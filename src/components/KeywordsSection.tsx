
import { ChatInterface } from "@/components/ChatInterface";
import { FileUpload } from "@/components/FileUpload";
import { KeywordAnalytics } from "@/components/KeywordAnalytics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function KeywordsSection() {
  return (
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
  );
}
