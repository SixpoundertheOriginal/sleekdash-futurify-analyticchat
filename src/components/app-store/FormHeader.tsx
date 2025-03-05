
import { BarChart } from "lucide-react";

export function FormHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-sm">
        <BarChart className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-display font-semibold text-white tracking-tight">
        AI-Powered App Store Analysis
      </h2>
    </div>
  );
}
