
import { Card } from "@/components/ui/card";
import { formatMetric } from "@/utils/analytics/formatting";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  format: "number" | "currency" | "percentage";
  inverseColor?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format,
  inverseColor = false 
}: MetricCardProps) {
  // Skip rendering if we don't have a value for this metric
  if (value === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-6 bg-white/3 backdrop-blur-sm border border-white/8 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/70">{title}</span>
              </div>
              <span className="text-xl font-semibold text-white/50 mt-3">
                No data
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs text-white/40 bg-white/5 border border-white/5">
              N/A
            </div>
          </div>
          
          <div className="mt-5 h-1 bg-white/5 rounded-full overflow-hidden" />
        </Card>
      </motion.div>
    );
  }

  const displayPositiveColor = inverseColor 
    ? change < 0 
    : change > 0;
    
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white/3 backdrop-blur-sm border border-white/8 shadow-sm transition-all hover:shadow-md hover:border-white/15">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-white/70" />
              <span className="text-sm text-white/70">{title}</span>
            </div>
            <motion.span 
              className="text-xl font-semibold text-white mt-3 font-display tracking-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              {formatMetric(value, format)}
            </motion.span>
          </div>
          <motion.div 
            className={`flex items-center px-3 py-1.5 rounded-full text-xs border ${
              displayPositiveColor 
                ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' 
                : 'text-rose-400 bg-rose-500/5 border-rose-500/10'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {change >= 0 ? '+' : ''}{change}%
          </motion.div>
        </div>
        
        <div className="mt-5 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${displayPositiveColor ? 'bg-emerald-500' : 'bg-rose-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(change), 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
