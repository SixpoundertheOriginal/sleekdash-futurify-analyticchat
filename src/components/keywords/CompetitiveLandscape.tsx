
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProcessedKeywordData } from './types';
import { CustomTooltip } from './CustomTooltip';
import { 
  formatPercentage, 
  getValueBasedColor, 
  getStandardChartOptions, 
  MetricCategory 
} from '@/utils/metrics/standardizedMetrics';

interface CompetitiveLandscapeProps {
  data: ProcessedKeywordData[];
}

export function CompetitiveLandscape({ data }: CompetitiveLandscapeProps) {
  // Make sure we have data
  if (!data || data.length === 0) {
    console.error("No data provided to CompetitiveLandscape");
    return <div className="text-center py-10 text-white/60">No keyword data available</div>;
  }

  const sortedData = [...data].sort((a, b) => b.volume - a.volume).slice(0, 8);
  console.log("CompetitiveLandscape data:", sortedData.length, "items");

  // Get standard chart options for competitive metrics
  const chartOptions = getStandardChartOptions(MetricCategory.OPPORTUNITY);

  // Custom coloring function for the bars using standardized utilities
  const getChanceColor = (chance: number) => getValueBasedColor(chance, { low: 30, medium: 60 });
  const getDifficultyColor = (difficulty: number) => {
    // Inverse the value since lower difficulty is better
    const inverseDifficulty = 100 - difficulty;
    return getValueBasedColor(inverseDifficulty, { low: 30, medium: 60 });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Competitive Landscape</h2>
        <span className="text-xs text-white/60">Top keywords by volume</span>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={chartOptions.grid.stroke} 
              horizontal={false} 
            />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tick={{ fill: chartOptions.text.fill }} 
            />
            <YAxis 
              type="category" 
              dataKey="keyword" 
              width={140} 
              tick={{ fill: chartOptions.text.fill }}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              contentStyle={chartOptions.tooltip.contentStyle}
            />
            <Bar 
              dataKey="difficulty" 
              name="Difficulty Score" 
              barSize={12}
              fillOpacity={0.9}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`difficulty-${index}`} fill={getDifficultyColor(entry.difficulty)} />
              ))}
            </Bar>
            <Bar 
              dataKey="chance" 
              name="Ranking Chance %" 
              barSize={12}
              fillOpacity={0.9}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`chance-${index}`} fill={getChanceColor(entry.chance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
