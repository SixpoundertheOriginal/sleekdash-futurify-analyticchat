
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, PieChart, BarChart, MessageSquare } from "lucide-react";

interface TabTriggersProps {
  isMobile: boolean;
}

export function TabTriggers({ isMobile }: TabTriggersProps) {
  return (
    <TabsList className="bg-transparent overflow-x-auto max-w-full hide-scrollbar">
      <TabsTrigger value="input" className="data-[state=active]:bg-primary data-[state=active]:text-white">
        <FileText className="h-4 w-4 mr-2" />
        <span className={isMobile ? "hidden" : "inline"}>Input</span>
      </TabsTrigger>
      <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-white">
        <PieChart className="h-4 w-4 mr-2" />
        <span className={isMobile ? "hidden" : "inline"}>Analysis</span>
      </TabsTrigger>
      <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white">
        <BarChart className="h-4 w-4 mr-2" />
        <span className={isMobile ? "hidden" : "inline"}>Dashboard</span>
      </TabsTrigger>
      <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-white">
        <BarChart className="h-4 w-4 mr-2" />
        <span className={isMobile ? "hidden" : "inline"}>Advanced</span>
      </TabsTrigger>
      <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-white">
        <MessageSquare className="h-4 w-4 mr-2" />
        <span className={isMobile ? "hidden" : "inline"}>Chat</span>
      </TabsTrigger>
    </TabsList>
  );
}
