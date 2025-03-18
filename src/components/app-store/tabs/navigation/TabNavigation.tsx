
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  // Define the tab order - removed "metrics" tab
  const tabOrder = ["input", "extraction", "analysis", "dashboard", "advanced", "chat"];
  
  // Get the current tab index
  const currentIndex = tabOrder.indexOf(activeTab);
  
  // Go to previous tab
  const goToPreviousTab = () => {
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };
  
  // Go to next tab
  const goToNextTab = () => {
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousTab}
        disabled={currentIndex <= 0}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextTab}
        disabled={currentIndex >= tabOrder.length - 1}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
