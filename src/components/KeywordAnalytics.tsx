
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCards } from "./keywords/MetricCards";
import { OpportunityMatrix } from "./keywords/OpportunityMatrix";
import { CompetitiveLandscape } from "./keywords/CompetitiveLandscape";
import { TopOpportunities } from "./keywords/TopOpportunities";
import { KeywordMetric } from "./keywords/types";

const keywordData: KeywordMetric[] = [
  { keyword: "books for kids", volume: 45, difficulty: 20, kei: 73, relevancy: 85, chance: 45, growth: 15 },
  { keyword: "reading apps for kids", volume: 35, difficulty: 15, kei: 45, relevancy: 90, chance: 50, growth: 12 },
  { keyword: "reading apps for kids for free", volume: 30, difficulty: 5, kei: 27, relevancy: 88, chance: 55, growth: 8 },
  { keyword: "reading games for kids", volume: 39, difficulty: 2, kei: 62, relevancy: 92, chance: 65, growth: 20 },
  { keyword: "hooked on phonics", volume: 25, difficulty: 10, kei: 30, relevancy: 75, chance: 40, growth: 5 },
  { keyword: "reading eggs", volume: 24, difficulty: 8, kei: 28, relevancy: 80, chance: 45, growth: 10 },
  { keyword: "free kids books", volume: 28, difficulty: 6, kei: 32, relevancy: 78, chance: 48, growth: 15 },
  { keyword: "learn to read for kids free", volume: 22, difficulty: 3, kei: 26, relevancy: 86, chance: 52, growth: 18 },
  { keyword: "kids reading app", volume: 20, difficulty: 5, kei: 24, relevancy: 89, chance: 50, growth: 22 }
];

export function KeywordAnalytics() {
  const [activeTab, setActiveTab] = useState('opportunity');

  // Calculate additional metrics
  const processedData = keywordData.map(item => ({
    ...item,
    opportunityScore: (item.kei * item.chance / Math.max(1, item.difficulty)) * 10
  }));

  const sortedByOpportunity = [...processedData].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const avgVolume = Math.round(keywordData.reduce((sum, item) => sum + item.volume, 0) / keywordData.length);
  const avgDifficulty = Math.round(keywordData.reduce((sum, item) => sum + item.difficulty, 0) / keywordData.length);

  const getColor = (score: number) => {
    if (score > 60) return "#4ade80";
    if (score > 30) return "#fb923c";
    return "#f87171";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <MetricCards 
        topOpportunity={sortedByOpportunity[0]}
        keywordCount={keywordData.length}
        avgVolume={avgVolume}
        avgDifficulty={avgDifficulty}
        trendData={keywordData}
      />

      <div className="border-b border-white/10">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'opportunity' ? 'text-primary border-b-2 border-primary' : 'text-white/60'}`}
            onClick={() => setActiveTab('opportunity')}
          >
            Opportunity Matrix
          </Button>
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'competitive' ? 'text-primary border-b-2 border-primary' : 'text-white/60'}`}
            onClick={() => setActiveTab('competitive')}
          >
            Competitive Landscape
          </Button>
          <Button
            variant="ghost"
            className={`pb-2 px-1 rounded-none ${activeTab === 'top5' ? 'text-primary border-b-2 border-primary' : 'text-white/60'}`}
            onClick={() => setActiveTab('top5')}
          >
            Top Opportunities
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white/5 border-white/10">
        {activeTab === 'opportunity' && (
          <OpportunityMatrix data={processedData} getColor={getColor} />
        )}

        {activeTab === 'competitive' && (
          <CompetitiveLandscape data={processedData} />
        )}

        {activeTab === 'top5' && (
          <TopOpportunities data={processedData} />
        )}
      </Card>
    </div>
  );
}
