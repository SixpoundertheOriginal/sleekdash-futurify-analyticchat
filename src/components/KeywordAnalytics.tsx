
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MetricCards } from "./keywords/MetricCards";
import { OpportunityMatrix } from "./keywords/OpportunityMatrix";
import { CompetitiveLandscape } from "./keywords/CompetitiveLandscape";
import { TopOpportunities } from "./keywords/TopOpportunities";
import { useKeywordAnalytics } from "@/hooks/useKeywordAnalytics";

export function KeywordAnalytics() {
  const [activeTab, setActiveTab] = useState('opportunity');
  const {
    isLoading,
    error,
    keywordData,
    topOpportunity,
    keywordCount,
    avgVolume,
    avgDifficulty,
    refreshData
  } = useKeywordAnalytics();

  const getColor = (score: number) => {
    if (score > 60) return "#4ade80";
    if (score > 30) return "#fb923c";
    return "#f87171";
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load keyword analytics: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="h-48 rounded-lg bg-indigo-800/5 animate-pulse" />
        <div className="grid gap-4 grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-indigo-800/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  console.log("Rendering KeywordAnalytics with data:", keywordData?.length);
  console.log("Top opportunity:", topOpportunity);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Keyword Analytics Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshData()}
          className="bg-indigo-900/20 border-indigo-500/30 text-indigo-100 hover:bg-indigo-800/30"
        >
          Refresh Data
        </Button>
      </div>

      <MetricCards 
        topOpportunity={topOpportunity}
        keywordCount={keywordCount}
        avgVolume={avgVolume}
        avgDifficulty={avgDifficulty}
        trendData={keywordData}
      />

      <div className="border-b border-white/10">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'opportunity' ? 'text-indigo-300 border-b-2 border-indigo-500' : 'text-white/60'}`}
            onClick={() => setActiveTab('opportunity')}
          >
            Opportunity Matrix
          </Button>
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'competitive' ? 'text-indigo-300 border-b-2 border-indigo-500' : 'text-white/60'}`}
            onClick={() => setActiveTab('competitive')}
          >
            Competitive Landscape
          </Button>
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'top5' ? 'text-indigo-300 border-b-2 border-indigo-500' : 'text-white/60'}`}
            onClick={() => setActiveTab('top5')}
          >
            Top Opportunities
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-indigo-950/10 border-indigo-500/20">
        {activeTab === 'opportunity' && (
          <OpportunityMatrix data={keywordData} getColor={getColor} />
        )}

        {activeTab === 'competitive' && (
          <CompetitiveLandscape data={keywordData} />
        )}

        {activeTab === 'top5' && (
          <TopOpportunities data={keywordData} />
        )}
      </Card>
    </div>
  );
}
