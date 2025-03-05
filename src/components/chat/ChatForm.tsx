
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";
import { useState } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";
import { AssistantType } from "@/utils/thread-management";

interface ChatFormProps {
  message: string;
  dateRange: DateRange | null;
  onSubmit: (e: React.FormEvent) => void;
  isDateRangeSelected: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  setMessage: (message: string) => void;
  feature?: AssistantType;
}

export function ChatForm({
  message,
  dateRange,
  onSubmit,
  isDateRangeSelected,
  handleSubmit,
  setMessage,
  feature = 'general'
}: ChatFormProps) {
  const { toast } = useToast();
  
  const handleSubmitWithDateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require date range for the appStore feature
    const requiresDateRange = feature === 'appStore';
    
    if (requiresDateRange && !isDateRangeSelected && !message.trim().startsWith('/')) {
      toast({
        variant: "destructive",
        title: "Date Range Required",
        description: "Please select a date range to continue with your analysis."
      });
      return;
    }
    
    // Append date range info to the message if needed
    if (isDateRangeSelected && dateRange && !message.trim().startsWith('/')) {
      const originalMessage = message;
      const dateInfo = `Date range: ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}.\n\n`;
      setMessage(dateInfo + originalMessage);
      handleSubmit(e);
      // Reset to original message to avoid showing the date prefix in the input
      setTimeout(() => setMessage(""), 100);
    } else {
      handleSubmit(e);
    }
  };
  
  return { handleSubmitWithDateCheck };
}
