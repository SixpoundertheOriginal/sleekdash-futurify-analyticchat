
import { cn } from "@/lib/utils";

// Custom scrollbar styling
export const scrollbarClasses = cn(
  "scrollbar-thin",
  "scrollbar-thumb-primary/20",
  "scrollbar-track-transparent",
  "hover:scrollbar-thumb-primary/30"
);

// Badge variant styling
export const getBadgeVariantClass = (threadId: string, defaultId: string) => {
  return threadId === defaultId
    ? "bg-primary/20 hover:bg-primary/30 text-primary" 
    : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400";
};
