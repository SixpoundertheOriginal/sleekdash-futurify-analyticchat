
import { Card } from "@/components/ui/card";

export function NoDataCard() {
  return (
    <div className="grid gap-4 grid-cols-1">
      <Card className="p-6 bg-amber-500/10 border-amber-500/20 rounded-lg">
        <p className="text-white text-center">No data available. Please analyze some app store data to view metrics.</p>
      </Card>
    </div>
  );
}
