
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart2, LineChart, Gauge, MessageSquare, Upload, PieChart, Database } from "lucide-react";
import { useAppStore } from "@/contexts/AppStoreContext";

interface TabTriggersProps {
  isMobile?: boolean;
}

export function TabTriggers({ isMobile = false }: TabTriggersProps) {
  const { analysisResult } = useAppStore();
  
  // Make triggers responsive based on screen size
  if (isMobile) {
    return (
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="input">
          <Upload className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="extraction">
          <Database className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="analysis">
          <FileText className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="dashboard">
          <BarChart2 className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquare className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    );
  }
  
  return (
    <TabsList className="inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      <TabsTrigger 
        value="input" 
        className="flex items-center gap-2 data-[state=active]:text-primary"
      >
        <Upload className="h-4 w-4" />
        Input
      </TabsTrigger>
      <TabsTrigger 
        value="extraction" 
        className="flex items-center gap-2 data-[state=active]:text-primary"
      >
        <Database className="h-4 w-4" />
        Data Extraction
      </TabsTrigger>
      <TabsTrigger 
        value="analysis" 
        className="flex items-center gap-2 data-[state=active]:text-primary"
      >
        <FileText className="h-4 w-4" />
        Analysis
      </TabsTrigger>
      <TabsTrigger 
        value="dashboard" 
        className="flex items-center gap-2 data-[state=active]:text-primary"
      >
        <BarChart2 className="h-4 w-4" />
        Dashboard
      </TabsTrigger>
      <TabsTrigger 
        value="advanced" 
        className="flex items-center gap-2 data-[state=active]:text-primary"
      >
        <LineChart className="h-4 w-4" />
        Advanced
      </TabsTrigger>
      <TabsTrigger 
        value="chat" 
        className="flex items-center gap-2 data-[state=active]:text-primary hidden md:flex"
      >
        <MessageSquare className="h-4 w-4" />
        Chat
      </TabsTrigger>
    </TabsList>
  );
}
