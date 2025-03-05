import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface SkeletonItemProps {
  height?: string;
  width?: string;
  className?: string;
}

interface SkeletonWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  items?: SkeletonItemProps[];
  count?: number;
}

export function SkeletonWrapper({
  isLoading,
  children,
  className,
  items,
  count = 1,
}: SkeletonWrapperProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  // If specific skeleton items are provided, render those
  if (items && items.length > 0) {
    return (
      <div className={cn("animate-pulse space-y-3", className)} role="status" aria-label="Loading content">
        {items.map((item, i) => (
          <Skeleton
            key={i}
            className={cn("bg-white/10", item.className)}
            style={{
              height: item.height,
              width: item.width,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Otherwise render a specified count of skeleton items
  return (
    <div className={cn("animate-pulse space-y-3", className)} role="status" aria-label="Loading content">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-8 w-full bg-white/10" />
        ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
