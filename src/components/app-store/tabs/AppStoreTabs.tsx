
import { Tabs } from "@/components/ui/tabs";
import { useDevice } from "@/hooks/use-mobile";
import { TabNavigation } from "./navigation/TabNavigation";
import { TabTriggers } from "./navigation/TabTriggers";
import { TabContent } from "./content/TabContent";
import { useAppStore } from "@/contexts/AppStoreContext";

export function AppStoreTabs() {
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <Tabs
      defaultValue="input"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex justify-between items-center border-b border-white/10 px-4">
        <TabTriggers isMobile={isMobile} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <TabContent />
    </Tabs>
  );
}
