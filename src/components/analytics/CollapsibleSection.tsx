
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevice } from "@/hooks/use-mobile";

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
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  
  // For mobile devices, we may want different default behavior for certain sections
  const [isExpanded, setIsExpanded] = useState(isMobile ? false : defaultExpanded);
  
  // Generate a unique ID for ARIA attributes
  const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const contentId = `content-${sectionId}`;
  const headerId = `header-${sectionId}`;

  return (
    <div 
      className="border border-white/10 rounded-lg bg-white/5 overflow-hidden transition-all duration-200"
      role="region"
      aria-labelledby={headerId}
    >
      <div 
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        id={headerId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
          aria-pressed={isExpanded}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      <div 
        id={contentId}
        className={`transition-all duration-300 ${
          isExpanded 
            ? "max-h-[2000px] opacity-100 p-3 sm:p-4 pt-0" 
            : "max-h-0 opacity-0 overflow-hidden p-0"
        }`}
        role="region"
        aria-hidden={!isExpanded}
      >
        {children}
      </div>
    </div>
  );
}
