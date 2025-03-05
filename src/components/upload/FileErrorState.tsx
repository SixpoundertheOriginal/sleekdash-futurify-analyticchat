
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileErrorStateProps {
  errorMessage: string;
  onTryAgain: () => void;
}

export function FileErrorState({ errorMessage, onTryAgain }: FileErrorStateProps) {
  return (
    <>
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-sm text-red-400 text-center px-6">{errorMessage}</p>
      <Button 
        variant="outline" 
        className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
        onClick={onTryAgain}
      >
        Try Again
      </Button>
    </>
  );
}
