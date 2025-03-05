
import { Card } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Card className="p-4 bg-rose-500/10 border-rose-500/20 rounded-lg">
      <p className="text-rose-500">Error processing analysis data: {error}</p>
    </Card>
  );
}
