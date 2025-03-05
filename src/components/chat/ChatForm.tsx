
import { DateRange } from "@/components/chat/DateRangePicker";
import { format } from "date-fns";
import { useState } from "react";
import { Message } from "@/types/chat";
import { useToast } from "@/components/ui/use-toast";

interface ChatFormProps {
  message: string;
  dateRange: DateRange | null;
  onSubmit: (e: React.FormEvent) => void;
  isDateRangeSelected: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  setMessage: (message: string) => void;
}

export function ChatForm({
  message,
  dateRange,
  onSubmit,
  isDateRangeSelected,
  handleSubmit,
  setMessage
}: ChatFormProps) {
  const { toast } = useToast();
  
  const handleSubmitWithDateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDateRangeSelected && !message.trim().startsWith('/')) {
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
