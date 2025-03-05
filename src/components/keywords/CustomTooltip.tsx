
import { HelpCircle } from "lucide-react";

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
      <div className="bg-gray-900 p-3 border border-indigo-500/20 shadow-lg rounded-md">
        <p className="font-bold text-indigo-300">{data.keyword}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
          <div>
            <p className="text-sm flex items-center gap-1">
              Volume: 
              <span className="text-white">{data.volume.toLocaleString()}</span>
              <span className="relative group">
                <HelpCircle className="h-3 w-3 text-indigo-400/70 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-xs text-white p-1 rounded w-32 text-center">
                  Monthly search volume
                </span>
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm flex items-center gap-1">
              Difficulty: 
              <span className="text-white">{data.difficulty}</span>
              <span className="relative group">
                <HelpCircle className="h-3 w-3 text-indigo-400/70 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-xs text-white p-1 rounded w-32 text-center">
                  Competition level (0-100)
                </span>
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm flex items-center gap-1">
              KEI: 
              <span className="text-white">{data.kei.toFixed(1)}</span>
              <span className="relative group">
                <HelpCircle className="h-3 w-3 text-indigo-400/70 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-xs text-white p-1 rounded w-40 text-center">
                  Keyword Efficiency Index (higher is better)
                </span>
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm flex items-center gap-1">
              Relevancy: 
              <span className="text-white">{data.relevancy}</span>
              <span className="relative group">
                <HelpCircle className="h-3 w-3 text-indigo-400/70 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-xs text-white p-1 rounded w-32 text-center">
                  How relevant to your niche (0-100)
                </span>
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm flex items-center gap-1">
              Chance: 
              <span className="text-white">{data.chance}%</span>
              <span className="relative group">
                <HelpCircle className="h-3 w-3 text-indigo-400/70 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-xs text-white p-1 rounded w-40 text-center">
                  Estimated ranking probability
                </span>
              </span>
            </p>
          </div>
          {data.opportunityScore && (
            <div>
              <p className="text-sm flex items-center gap-1">
                Opportunity: 
                <span className="text-green-400">{(data.opportunityScore/10).toFixed(1)}</span>
                <span className="relative group">
                  <HelpCircle className="h-3 w-3 text-indigo-400/70 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 text-xs text-white p-1 rounded w-44 text-center">
                    Combined score of volume, difficulty and relevance (0-10)
                  </span>
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
