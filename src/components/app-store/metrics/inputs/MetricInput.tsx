
import { Input } from "@/components/ui/input";

interface MetricInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  changeValue?: number;
  onChangeValueUpdate?: (value: string) => void;
  benchmark?: number;
  formatter?: (value: number) => string;
}

export function MetricInput({ 
  label, 
  value, 
  onChange, 
  changeValue, 
  onChangeValueUpdate,
  benchmark,
  formatter = (val) => val.toString() 
}: MetricInputProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-white/60";
  };
  
  return (
    <div className="bg-white/5 p-3 rounded-md border border-white/10">
      <div className="flex justify-between items-start mb-2">
        <label className="text-sm font-medium">{label}</label>
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
          className="bg-white/10 border-white/20"
        />
        
        {changeValue !== undefined && onChangeValueUpdate && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Change %:</span>
            <Input 
              value={changeValue.toString()}
              onChange={(e) => onChangeValueUpdate(e.target.value)}
              className="bg-white/10 border-white/20 h-7 text-xs"
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
