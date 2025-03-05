
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export function FormInput({ value, onChange, disabled }: FormInputProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="analysis-input" className="text-white font-medium">Paste Your App Store Data</Label>
      <Textarea 
        id="analysis-input"
        value={value}
        onChange={onChange}
        className="bg-white/5 border-white/10 text-white min-h-[150px] focus:ring-primary/30 transition-all duration-200 rounded-lg"
        placeholder="Paste your app store data here to analyze performance metrics, user behavior, and market trends..."
        disabled={disabled}
      />
    </div>
  );
}
