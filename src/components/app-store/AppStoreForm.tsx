
import { Card } from "@/components/ui/card";
import { FormHeader } from "./FormHeader";
import { FormInput } from "./FormInput";
import { FormButtons } from "./FormButtons";
import { useAppStoreForm } from "@/hooks/useAppStoreForm";

interface AppStoreFormProps {
  onProcessSuccess: (data: any) => void;
  onAnalysisSuccess: (analysisResult: string) => void;
  isProcessing: boolean;
  isAnalyzing: boolean;
  setProcessing: (processing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
}

export function AppStoreForm({
  onProcessSuccess,
  onAnalysisSuccess,
  isProcessing,
  isAnalyzing,
  setProcessing,
  setAnalyzing
}: AppStoreFormProps) {
  const {
    appDescription,
    setAppDescription,
    handleTextCleaningAndProcessing,
    handleAnalysis
  } = useAppStoreForm(
    onProcessSuccess,
    onAnalysisSuccess,
    setProcessing,
    setAnalyzing
  );

  return (
    <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm shadow-lg transition-all hover:shadow-primary/10">
      <FormHeader />
      
      <div className="space-y-5">
        <FormInput 
          value={appDescription}
          onChange={(e) => setAppDescription(e.target.value)}
          disabled={isAnalyzing || isProcessing}
        />

        <FormButtons 
          isProcessing={isProcessing}
          isAnalyzing={isAnalyzing}
          appDescription={appDescription}
          onProcessClick={handleTextCleaningAndProcessing}
          onAnalyzeClick={() => handleAnalysis()}
        />
      </div>
    </Card>
  );
}
