
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInterface() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-white/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b p-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Analysis Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat messages will go here */}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-1 rounded-lg border bg-white/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
