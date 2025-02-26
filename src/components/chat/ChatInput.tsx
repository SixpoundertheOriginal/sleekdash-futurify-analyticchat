
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ message, isLoading, onMessageChange, onSubmit }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="border-t border-white/10 p-4 bg-white/5">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={isLoading ? "✨ Processing..." : "Ask about your data..."}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
