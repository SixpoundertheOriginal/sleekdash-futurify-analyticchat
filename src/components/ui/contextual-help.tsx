
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { ReactNode } from "react";

interface ContextualHelpProps {
  content: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  icon?: "help" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ContextualHelp({
  content,
  position = "top",
  icon = "help",
  size = "sm",
  className,
}: ContextualHelpProps) {
  const sideOffset = 5;
  
  // Map size to icon dimensions
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];
  
  // Select the appropriate icon
  const IconComponent = icon === "help" ? HelpCircle : Info;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            className={`text-primary/60 hover:text-primary focus:outline-none transition-colors duration-300 ${className}`}
            aria-label="Get help"
          >
            <IconComponent className={`${iconSize} stroke-current`} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={position} 
          sideOffset={sideOffset} 
          className="max-w-xs font-sans bg-gradient-to-br from-popover to-popover/90 backdrop-blur-xl p-3 text-sm border border-white/10"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
