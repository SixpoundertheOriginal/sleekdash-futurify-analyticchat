
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ message, isLoading, onMessageChange, onSubmit }: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="border-t border-white/10 p-3 bg-white/5">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={isLoading ? "Processing..." : "Ask about your keyword data..."}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${
            !message.trim() && !isLoading ? 'opacity-50' : ''
          }`}
          variant={message.trim() ? "default" : "outline"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
