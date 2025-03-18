
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDevice } from "@/hooks/use-mobile";
import { ContextualHelp } from "@/components/ui/contextual-help";

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
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={inputId} 
          className="text-white font-medium"
        >
          {isMobile ? "App Store Data" : "Paste Your App Store Data"}
        </Label>
        <ContextualHelp 
          content={
            <div>
              <p className="font-medium">Accepted Data Formats:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Raw data from App Store Connect</li>
                <li>CSV exports from AppFigures</li>
                <li>Sensortower report exports</li>
                <li>Plain text description of your app metrics</li>
              </ul>
              <p className="mt-2 text-xs">For best results, include data about downloads, revenue, ratings, and user engagement metrics.</p>
            </div>
          } 
        />
      </div>
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
      
      {value.length > 0 && value.length < 100 && (
        <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded text-sm text-amber-400">
          <p className="flex items-center gap-1.5">
            <span className="text-amber-500">!</span>
            <span>Your input seems too short. For best results, paste your complete App Store Connect data.</span>
          </p>
        </div>
      )}
      
      {!value && !disabled && (
        <div className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-md">
          <p className="text-sm text-white/70 font-medium mb-1">Format Tips for Best Results:</p>
          <ul className="text-xs text-white/60 space-y-1 list-disc pl-4">
            <li>Include metric names and their values (e.g., "Downloads: 25,000")</li>
            <li>Include percentage changes where available (e.g., "+5% week-over-week")</li>
            <li>Include date ranges (e.g., "June 1 - June 30, 2023")</li>
            <li>Copy complete sections for Acquisition, Engagement, and Financial metrics</li>
          </ul>
        </div>
      )}
    </div>
  );
}
