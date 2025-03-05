
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevice } from "@/hooks/use-mobile";
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper";

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function CollapsibleSection({ 
  title, 
  defaultExpanded = true, 
  children,
  isLoading = false
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
      className="border border-white/8 rounded-lg bg-white/3 overflow-hidden transition-all duration-200 backdrop-blur-sm shadow-sm"
      role="region"
      aria-labelledby={headerId}
    >
      <SkeletonWrapper 
        isLoading={isLoading} 
        className="p-5"
        items={[
          { height: "24px", width: "180px", className: "rounded-md" }
        ]}
      >
        <div 
          className="flex items-center justify-between p-5 cursor-pointer"
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
          <h2 className="text-lg sm:text-xl font-display font-semibold text-white">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
      </SkeletonWrapper>
      
      <div 
        id={contentId}
        className={`transition-all duration-300 ${
          isExpanded 
            ? "max-h-[2000px] opacity-100 px-5 pb-5" 
            : "max-h-0 opacity-0 overflow-hidden p-0"
        }`}
        role="region"
        aria-hidden={!isExpanded}
      >
        <SkeletonWrapper isLoading={isLoading} count={3}>
          {children}
        </SkeletonWrapper>
      </div>
    </div>
  );
}
