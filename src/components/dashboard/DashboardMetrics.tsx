
import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Metric {
  metric: string;
  value: string;
  change: number;
}

interface DashboardMetricsProps {
  metrics: Metric[];
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  if (!metrics || !Array.isArray(metrics)) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((item, index) => (
        <Card key={index} className="p-6 bg-white/5 border-white/10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-white/60">{item.metric}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <div
              className={cn(
                "flex items-center text-xs",
                item.change > 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {item.change > 0 ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span>{Math.abs(item.change)}%</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
