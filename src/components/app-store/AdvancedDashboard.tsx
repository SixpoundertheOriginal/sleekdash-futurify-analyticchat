
import { Card } from "@/components/ui/card";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { DateRange } from "@/components/chat/DateRangePicker";
import { GlobalMetrics } from "./metrics/GlobalMetrics";
import { ExecutiveSummary } from "./metrics/ExecutiveSummary";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { useDashboardState } from "@/hooks/useDashboardState";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

interface AdvancedDashboardProps {
  data: ProcessedAnalytics;
  dateRange: DateRange | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AdvancedDashboard({ data, dateRange, isLoading = false, onRefresh }: AdvancedDashboardProps) {
  const { activeTab, setActiveTab, formattedDateRange } = useDashboardState({ data, dateRange });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastTouchY, setLastTouchY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  // Swipe handlers for tab navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const nextTab = Math.min(Number(activeTab) + 1, 3);
      if (nextTab !== Number(activeTab)) {
        setActiveTab(String(nextTab));
      }
    },
    onSwipedRight: () => {
      const prevTab = Math.max(Number(activeTab) - 1, 0);
      if (prevTab !== Number(activeTab)) {
        setActiveTab(String(prevTab));
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50
  });

  // Pull to refresh functionality
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setLastTouchY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY > lastTouchY) {
        const distance = e.touches[0].clientY - lastTouchY;
        if (distance > 5) {
          setPullDistance(Math.min(distance, 80));
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 60) {
        handleRefresh();
      }
      setPullDistance(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lastTouchY, pullDistance]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Call the external refresh handler if provided
    if (onRefresh) {
      onRefresh();
    }
    
    // Simulate refreshing data or wait for the onRefresh promise
    setTimeout(() => {
      setIsRefreshing(false);
      // Vibrate for 100ms on refresh completion if browser supports it
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-8 animate-fade" {...swipeHandlers}>
      {(pullDistance > 0 || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm rounded-full p-2 mt-4 border border-primary/20"
            initial={{ y: -50 }}
            animate={{ y: isRefreshing ? 20 : Math.max(0, pullDistance - 40) }}
            exit={{ y: -50 }}
          >
            {isRefreshing ? (
              <Loader className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <motion.div 
                className="h-6 w-6 text-primary flex items-center justify-center"
                animate={{ rotate: Math.min(pullDistance * 3, 180) }}
              >
                ↓
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      <DashboardHeader 
        title={data.summary.title} 
        dateRange={dateRange} 
        formattedDateRange={formattedDateRange}
        onRefresh={onRefresh} 
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key="executive-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExecutiveSummary 
            title={data.summary.title}
            summary={data.summary.executiveSummary}
            dateRange={formattedDateRange}
            data={data}
          />
        </motion.div>
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key="global-metrics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlobalMetrics data={data} isLoading={isLoading || isRefreshing} />
        </motion.div>
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`dashboard-tabs-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border border-white/10 bg-white/3 backdrop-blur-sm overflow-hidden shadow-sm">
            <DashboardTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              data={data}
            />
          </Card>
        </motion.div>
      </AnimatePresence>
      
      <div className="text-xs text-white/40 text-center mt-8 font-mono">
        <p>Swipe left/right to change tabs • Pull down to refresh</p>
      </div>
    </div>
  );
}
