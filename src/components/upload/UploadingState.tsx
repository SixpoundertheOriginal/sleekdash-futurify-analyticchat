
import { Loader2 } from "lucide-react";

export function UploadingState() {
  return (
    <>
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm text-white/80">Processing your file...</p>
    </>
  );
}
