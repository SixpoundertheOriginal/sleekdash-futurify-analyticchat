
import { Loader2 } from "lucide-react";

interface UploadingStateProps {
  message?: string;
}

export function UploadingState({ message = "Processing your file..." }: UploadingStateProps) {
  return (
    <>
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm text-white/80">{message}</p>
    </>
  );
}
