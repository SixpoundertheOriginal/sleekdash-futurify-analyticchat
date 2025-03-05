
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatErrorProps {
  error: string | null;
  onDismiss: () => void;
}

export function ChatError({ error, onDismiss }: ChatErrorProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mx-3 mt-2 bg-red-500/10 text-red-200 border-red-500/20">
      <AlertDescription className="flex justify-between items-center">
        <span>{error}</span>
        <button onClick={onDismiss} className="p-1">
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
}
