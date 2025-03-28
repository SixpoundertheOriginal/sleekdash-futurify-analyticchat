
import { Card } from "@/components/ui/card";
import { ProcessedKeywordData } from './types';
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { memo, useEffect, useState } from "react";
import { generateKeywordRecommendations } from "@/utils/keywords/dummyData";

interface TopOpportunitiesProps {
  data: ProcessedKeywordData[];
}

function TopOpportunitiesBase({ data }: TopOpportunitiesProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const topOpportunities = [...data]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 10);

  // Generate AI recommendations when the data changes
  useEffect(() => {
    if (data.length > 0) {
      setRecommendations(generateKeywordRecommendations(data));
    }
  }, [data]);

  // Table header component
  const TableHeader = () => (
    <thead>
      <tr className="text-xs text-white/60 border-b border-indigo-500/20">
        <th className="px-3 py-3 text-left">Keyword</th>
        <th className="px-3 py-3 text-right">Volume</th>
        <th className="px-3 py-3 text-right">Difficulty</th>
        <th className="px-3 py-3 text-right">KEI</th>
        <th className="px-3 py-3 text-right">Relevancy%</th>
        <th className="px-3 py-3 text-right">Chance%</th>
        <th className="px-3 py-3 text-right">Opp Score</th>
      </tr>
    </thead>
  );

  // Table row component as a renderItem function for VirtualizedList
  const renderKeywordRow = (item: ProcessedKeywordData, index: number) => (
    <tr key={index} className="hover:bg-indigo-900/10 text-sm">
      <td className="px-3 py-3 font-medium text-indigo-300">{item.keyword}</td>
      <td className="px-3 py-3 text-right text-white">{item.volume.toLocaleString()}</td>
      <td className="px-3 py-3 text-right">
        <span className={item.difficulty < 30 ? 'text-green-400' : item.difficulty < 50 ? 'text-yellow-400' : 'text-red-400'}>
          {item.difficulty}
        </span>
      </td>
      <td className="px-3 py-3 text-right text-white">{item.kei.toFixed(1)}</td>
      <td className="px-3 py-3 text-right text-white">{item.relevancy}%</td>
      <td className="px-3 py-3 text-right text-white">{item.chance}%</td>
      <td className="px-3 py-3 text-right">
        <span className="font-semibold text-green-400">{(item.opportunityScore/10).toFixed(1)}</span>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Top Keyword Opportunities</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <TableHeader />
          <tbody className="divide-y divide-indigo-500/10">
            {topOpportunities.length > 20 ? (
              <VirtualizedList
                data={topOpportunities}
                renderItem={renderKeywordRow}
                itemHeight={40}
                height={300}
                className="w-full"
              />
            ) : (
              topOpportunities.map((item, index) => renderKeywordRow(item, index))
            )}
          </tbody>
        </table>
      </div>

      <Card className="mt-8 p-4 bg-indigo-600/5 border-indigo-500/20">
        <h3 className="text-indigo-300 font-semibold mb-2">AI-Powered Recommendations</h3>
        <ul className="space-y-2 text-sm text-white/80">
          {recommendations.length > 0 ? (
            recommendations.slice(0, 5).map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 mt-2 rounded-full bg-indigo-400"></div>
                <span>{recommendation}</span>
              </li>
            ))
          ) : (
            <>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 mt-2 rounded-full bg-indigo-400"></div>
                <span>Optimize app content for <span className="text-indigo-300 font-medium">reading games for kids</span> (low difficulty, high relevancy)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 mt-2 rounded-full bg-indigo-400"></div>
                <span>Create landing pages for <span className="text-indigo-300 font-medium">free reading app for children</span> to capitalize on higher volume</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 mt-2 rounded-full bg-indigo-400"></div>
                <span>Include <span className="text-indigo-300 font-medium">interactive reading</span> in app store metadata (appears in 3 of top 10 opportunities)</span>
              </li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const TopOpportunities = memo(TopOpportunitiesBase);
