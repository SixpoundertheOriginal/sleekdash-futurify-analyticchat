
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDevice } from "@/hooks/use-mobile";

interface FormInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  placeholder?: string;
}

export function FormInput({ value, onChange, disabled, placeholder }: FormInputProps) {
  const deviceType = useDevice();
  const isMobile = deviceType === 'mobile';
  
  // Unique ID for accessibility association
  const inputId = "analysis-input";
  
  return (
    <div className="space-y-3">
      <Label 
        htmlFor={inputId} 
        className="text-white font-medium"
      >
        {isMobile ? "App Store Data" : "Paste Your App Store Data"}
      </Label>
      <Textarea 
        id={inputId}
        value={value}
        onChange={onChange}
        className="bg-white/5 border-white/10 text-white min-h-[100px] sm:min-h-[150px] md:min-h-[200px] focus:ring-primary/30 transition-all duration-200 rounded-lg"
        placeholder={placeholder || (isMobile ? 
          "Paste app store data here..." : 
          "Paste your app store data here to analyze performance metrics, user behavior, and market trends...")}
        disabled={disabled}
        style={{ fontSize: isMobile ? '16px' : undefined }} // Prevents zoom on iOS
        aria-label="App Store data input"
        aria-required="true"
        aria-describedby="input-description"
        aria-invalid={value.length < 10 && value.length > 0 ? "true" : "false"}
      />
      <div id="input-description" className="sr-only">
        Paste your App Store data to generate analytics and performance insights.
      </div>
    </div>
  );
}
