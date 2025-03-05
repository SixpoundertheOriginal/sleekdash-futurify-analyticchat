
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { KeywordsTabs } from "@/components/keywords/KeywordsTabs";
import { useState } from "react";

export function KeywordsSection() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
        <Sparkles className="h-5 w-5 text-primary" />
        Keywords Analysis & Insights
      </h2>

      <Card className="border border-white/10 bg-white/3 backdrop-blur-sm overflow-hidden shadow-sm">
        <KeywordsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Card>
      
      <div className="text-xs text-white/40 text-center mt-8 font-mono">
        <p>Use tabs to navigate between different keyword tools</p>
      </div>
    </div>
  );
}
