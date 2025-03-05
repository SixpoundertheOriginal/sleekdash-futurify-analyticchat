
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ContextualHelp } from "@/components/ui/contextual-help";

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  className?: string;
  overscan?: number;
  height?: number | string;
  showHelp?: boolean;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  itemHeight,
  className,
  overscan = 5,
  height = 400,
  showHelp = false,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(
        data.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );
      
      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateVisibleRange);
      // Initial calculation
      updateVisibleRange();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", updateVisibleRange);
      }
    };
  }, [data.length, itemHeight, overscan]);

  const totalHeight = data.length * itemHeight;
  const visibleItems = data.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div className="relative">
      {showHelp && (
        <div className="absolute top-2 right-2 z-10">
          <ContextualHelp 
            position="left"
            content={
              <div>
                <p className="font-medium">Virtualized List</p>
                <p className="mt-1 text-xs">This list only renders items currently visible in the viewport to improve performance.</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>Showing {visibleItems.length} of {data.length} total items</li>
                  <li>Scroll to view more items</li>
                  <li>Performance optimized for large datasets</li>
                </ul>
              </div>
            } 
          />
        </div>
      )}
      <div
        ref={containerRef}
        className={cn("overflow-auto scrollbar-thin scrollbar-thumb-primary/20", className)}
        style={{ height }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ position: "absolute", top: offsetY, width: "100%" }}>
            {visibleItems.map((item, index) => 
              renderItem(item, index + visibleRange.start)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
