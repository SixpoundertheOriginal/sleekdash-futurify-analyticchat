
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { KeywordsTabs } from "@/components/keywords/KeywordsTabs";
import { useState } from "react";

export function KeywordsSection() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 pb-2 border-b border-indigo-500/20">
        <Sparkles className="h-5 w-5 text-indigo-400" />
        Keywords Research & Analysis Hub
      </h2>

      <Card className="border border-indigo-500/10 bg-indigo-950/5 backdrop-blur-sm overflow-hidden shadow-sm">
        <KeywordsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Card>
      
      <div className="text-xs text-indigo-300/40 text-center mt-8 font-mono">
        <p>Discover high-performing keywords to boost your app's visibility</p>
      </div>
    </div>
  );
}
