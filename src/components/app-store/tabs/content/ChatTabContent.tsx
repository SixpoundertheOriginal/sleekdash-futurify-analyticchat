
import { TabsContent } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/ChatInterface";

export function ChatTabContent() {
  return (
    <TabsContent value="chat" className="mt-4 space-y-4">
      <ChatInterface feature="appStore" />
    </TabsContent>
  );
}
