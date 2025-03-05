
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { Message } from "@/types/chat";
import { DateRange } from "@/components/chat/DateRangePicker";

interface ChatContextType {
  message: string;
  setMessage: (message: string) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  isProcessing: boolean;
  isCreatingThread: boolean;
  setIsCreatingThread: (isCreating: boolean) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  dateRange: DateRange | null;
  setDateRange: (range: DateRange | null) => void;
  isDateRangeSelected: boolean;
  setIsDateRangeSelected: (selected: boolean) => void;
  lastFileUpload: Date | null;
  isCheckingForResponses: boolean;
  setIsCheckingForResponses: (isChecking: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatContextProvider({ children, initialState }: { 
  children: ReactNode,
  initialState?: Partial<ChatContextType>
}) {
  const [message, setMessage] = useState(initialState?.message || "");
  const [messages, setMessages] = useState<Message[]>(initialState?.messages || [{
    role: 'assistant',
    content: '✨ Welcome to your new conversation! How can I help you today?',
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(initialState?.isLoading || false);
  const [isProcessing, setIsProcessing] = useState(initialState?.isProcessing || false);
  const [isCreatingThread, setIsCreatingThread] = useState(initialState?.isCreatingThread || false);
  // Fix: Explicitly declare the state as boolean type instead of letting it infer as literal 'true'
  const [showStats, setShowStats] = useState<boolean>(initialState?.showStats !== undefined ? initialState.showStats : true);
  const [error, setError] = useState<string | null>(initialState?.error || null);
  const [dateRange, setDateRange] = useState<DateRange | null>(initialState?.dateRange || null);
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(initialState?.isDateRangeSelected || false);
  const [lastFileUpload, setLastFileUpload] = useState<Date | null>(initialState?.lastFileUpload || null);
  const [isCheckingForResponses, setIsCheckingForResponses] = useState(initialState?.isCheckingForResponses || false);

  // Create a wrapper for setShowStats that matches the expected function signature
  const setShowStatsWrapper = (show: boolean) => {
    setShowStats(show);
  };

  return (
    <ChatContext.Provider value={{
      message,
      setMessage,
      messages,
      setMessages,
      isLoading,
      isProcessing,
      isCreatingThread,
      setIsCreatingThread,
      showStats,
      setShowStats: setShowStatsWrapper,
      error,
      setError,
      dateRange,
      setDateRange,
      isDateRangeSelected,
      setIsDateRangeSelected,
      lastFileUpload,
      isCheckingForResponses,
      setIsCheckingForResponses
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
}
