
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
  fullScreen?: boolean;
}

export function LoadingOverlay({ 
  message = "Processing analytics data...",
  transparent = false,
  fullScreen = false
}: LoadingOverlayProps) {
  return (
    <div 
      className={`${fullScreen ? 'fixed' : 'absolute'} inset-0 flex items-center justify-center ${
        transparent ? 'bg-black/30' : 'bg-black/50'
      } backdrop-blur-sm rounded-lg z-10`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 p-4 bg-black/70 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
}
