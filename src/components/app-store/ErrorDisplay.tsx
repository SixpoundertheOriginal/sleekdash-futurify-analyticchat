
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Card className="p-4 bg-rose-500/10 border-rose-500/20 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-rose-500 font-medium">Error processing analysis data:</p>
          <p className="text-rose-400 text-sm mt-1">{error}</p>
          {error.includes("Edge Function") && (
            <p className="text-rose-400 text-xs mt-2 italic">
              This could be due to a connection issue with the Supabase Edge Function. 
              Please check that your app description contains valid data and try again.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
