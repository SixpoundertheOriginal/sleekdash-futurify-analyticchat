
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Target, ChartBar, Search, Award } from "lucide-react";
import { KeywordMetric } from "./types";

interface MetricCardsProps {
  topOpportunity: {
    keyword: string;
    opportunityScore: number;
  };
  keywordCount: number;
  avgVolume: number;
  avgDifficulty: number;
  trendData: KeywordMetric[];
}

export function MetricCards({ 
  topOpportunity,
  keywordCount,
  avgVolume,
  avgDifficulty,
  trendData
}: MetricCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 bg-indigo-950/5 border-indigo-500/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm">Top Opportunity</p>
            <h3 className="text-lg font-semibold text-indigo-300 mt-1">{topOpportunity.keyword}</h3>
          </div>
          <Target className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Opportunity Score</span>
            <span className="text-green-400 font-semibold">{(topOpportunity.opportunityScore/10).toFixed(1)}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-1">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, topOpportunity.opportunityScore)}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-indigo-950/5 border-indigo-500/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm">Total Keywords</p>
            <h3 className="text-lg font-semibold text-indigo-300 mt-1">{keywordCount}</h3>
          </div>
          <ChartBar className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/60">
            <span>Easy</span>
            <span>Medium</span>
            <span>Hard</span>
          </div>
          <div className="flex space-x-1 mt-1">
            <div className="h-2 rounded-l-full bg-green-500" style={{ width: '40%' }}></div>
            <div className="h-2 bg-yellow-500" style={{ width: '35%' }}></div>
            <div className="h-2 rounded-r-full bg-red-500" style={{ width: '25%' }}></div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-indigo-950/5 border-indigo-500/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm">Avg. Search Volume</p>
            <h3 className="text-lg font-semibold text-indigo-300 mt-1">{avgVolume.toLocaleString()}</h3>
          </div>
          <Search className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Monthly Growth</span>
            <span className="text-indigo-300 font-semibold">+12.4%</span>
          </div>
          <div className="h-8 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.slice(0, 10)}>
                <Line type="monotone" dataKey="growth" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-indigo-950/5 border-indigo-500/10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-sm">Avg. Difficulty</p>
            <h3 className="text-lg font-semibold text-indigo-300 mt-1">{avgDifficulty}</h3>
          </div>
          <Award className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-white/60">Easy (&lt;30)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <span className="text-white/60">Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-white/60">Hard (&gt;50)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
