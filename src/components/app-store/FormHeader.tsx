
import { BarChart } from "lucide-react";

export function FormHeader() {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-full bg-primary/20">
        <BarChart className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-lg font-display font-semibold text-white">AI-Powered App Store Analysis</h2>
    </div>
  );
}
