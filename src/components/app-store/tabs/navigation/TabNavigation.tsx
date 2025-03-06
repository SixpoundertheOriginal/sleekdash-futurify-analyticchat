
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabsOrder = ['input', 'analysis', 'dashboard', 'advanced', 'chat'];

  const navigateTab = (direction: 'prev' | 'next') => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateTab('prev')}
        disabled={activeTab === 'input'}
        className="text-white/60 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateTab('next')}
        disabled={activeTab === 'chat'}
        className="text-white/60 hover:text-white hover:bg-white/10"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
