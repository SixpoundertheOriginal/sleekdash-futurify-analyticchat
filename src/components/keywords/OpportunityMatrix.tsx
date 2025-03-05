
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { ProcessedKeywordData } from './types';
import { CustomTooltip } from './CustomTooltip';

interface OpportunityMatrixProps {
  data: ProcessedKeywordData[];
  getColor: (score: number) => string;
}

export function OpportunityMatrix({ data, getColor }: OpportunityMatrixProps) {
  // Make sure we have data
  if (!data || data.length === 0) {
    console.error("No data provided to OpportunityMatrix");
    return <div className="text-center py-10 text-white/60">No keyword data available</div>;
  }

  console.log("OpportunityMatrix data:", data.length, "items");

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Keyword Opportunity Matrix</h2>
        <span className="text-xs text-white/60">Bubble size = Opportunity Score</span>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              dataKey="difficulty" 
              name="Difficulty" 
              domain={[0, 70]}
              label={{ value: 'Difficulty', position: 'bottom', offset: 0, fill: '#9ca3af' }}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              type="number" 
              dataKey="volume" 
              name="Search Volume" 
              domain={[0, 'dataMax']}
              label={{ value: 'Search Volume', angle: -90, position: 'insideLeft', offset: -5, fill: '#9ca3af' }}
              tick={{ fill: '#9ca3af' }}
            />
            <ZAxis type="number" dataKey="opportunityScore" range={[40, 400]} name="Opportunity Score" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Keywords" data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.opportunityScore)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
