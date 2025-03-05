
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricsLoadingSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {Array(5).fill(0).map((_, i) => (
        <Card key={i} className="p-4 bg-white/5 border-white/10">
          <Skeleton className="h-4 w-20 mb-2 bg-white/10" />
          <Skeleton className="h-8 w-24 mb-3 bg-white/10" />
          <Skeleton className="h-4 w-16 bg-white/10" />
        </Card>
      ))}
    </div>
  );
}
