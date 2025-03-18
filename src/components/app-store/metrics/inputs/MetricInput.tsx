
import { Input } from "@/components/ui/input";
import { AlertTriangle, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface MetricInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  changeValue?: number;
  onChangeValueUpdate?: (value: string) => void;
  benchmark?: number;
  formatter?: (value: number) => string;
  description?: string;
  isRequired?: boolean;
}

export function MetricInput({ 
  label, 
  value, 
  onChange, 
  changeValue, 
  onChangeValueUpdate,
  benchmark,
  formatter = (val) => val.toString(),
  description,
  isRequired = false
}: MetricInputProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-white/60";
  };
  
  const isEmpty = value === '' || value === '0';
  
  return (
    <div className={`bg-white/5 p-3 rounded-md border ${isEmpty && isRequired ? 'border-amber-500/40' : 'border-white/10'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium">{label}</label>
          {isRequired && <span className="text-amber-500 text-xs">*</span>}
          
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-white/40" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px] text-xs">
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {benchmark !== undefined && (
          <div className="text-xs text-white/60">
            Benchmark: {formatter(benchmark)}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-white/10 border-white/20 ${isEmpty && isRequired ? 'border-amber-500/40' : ''}`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        
        {isEmpty && isRequired && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <AlertTriangle className="h-3 w-3" />
            <span>Required for accurate analysis</span>
          </div>
        )}
        
        {changeValue !== undefined && onChangeValueUpdate && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Change %:</span>
            <Input 
              value={changeValue.toString()}
              onChange={(e) => onChangeValueUpdate(e.target.value)}
              className="bg-white/10 border-white/20 h-7 text-xs"
              placeholder="% change"
            />
            <span className={`text-xs ${getChangeColor(changeValue)}`}>
              {changeValue > 0 ? "+" : ""}{changeValue}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
