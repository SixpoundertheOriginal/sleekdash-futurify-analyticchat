
interface TooltipData {
  keyword: string;
  volume: number;
  difficulty: number;
  kei: number;
  relevancy: number;
  chance: number;
  opportunityScore?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TooltipData;
  }>;
}

export function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 p-3 border border-primary/20 shadow-lg rounded-md">
        <p className="font-bold text-primary">{data.keyword}</p>
        <p className="text-sm">Volume: <span className="text-white">{data.volume}</span></p>
        <p className="text-sm">Difficulty: <span className="text-white">{data.difficulty}</span></p>
        <p className="text-sm">KEI: <span className="text-white">{data.kei}</span></p>
        <p className="text-sm">Relevancy: <span className="text-white">{data.relevancy}</span></p>
        <p className="text-sm">Chance: <span className="text-white">{data.chance}%</span></p>
        {data.opportunityScore && 
          <p className="text-sm">Opportunity: <span className="text-green-400">{(data.opportunityScore/10).toFixed(1)}</span></p>
        }
      </div>
    );
  }
  return null;
}
