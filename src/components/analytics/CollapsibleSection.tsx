
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ 
  title, 
  defaultExpanded = true, 
  children 
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-white/10 rounded-lg bg-white/5 overflow-hidden transition-all duration-200">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      <div 
        className={`transition-all duration-300 ${
          isExpanded 
            ? "max-h-[2000px] opacity-100 p-4 pt-0" 
            : "max-h-0 opacity-0 overflow-hidden p-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
