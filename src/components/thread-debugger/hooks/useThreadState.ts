
import { useState } from "react";
import { useThread, DEFAULT_THREAD_ID, DEFAULT_ASSISTANT_ID } from "@/contexts/ThreadContext";
import { useToast } from "@/hooks/use-toast";

export function useThreadState() {
  const { threadId, assistantId, setThreadId, setAssistantId, isValidThread } = useThread();
  const [newThreadId, setNewThreadId] = useState(threadId);
  const [newAssistantId, setNewAssistantId] = useState(assistantId);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isTestingThread, setIsTestingThread] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const resetToDefaults = () => {
    setNewThreadId(DEFAULT_THREAD_ID);
    setNewAssistantId(DEFAULT_ASSISTANT_ID);
    setThreadId(DEFAULT_THREAD_ID);
    setAssistantId(DEFAULT_ASSISTANT_ID);
    toast({
      title: "Reset Complete",
      description: "Thread and Assistant IDs reset to defaults",
    });
  };

  const applyChanges = () => {
    setThreadId(newThreadId);
    setAssistantId(newAssistantId);
    toast({
      title: "Changes Applied",
      description: "Thread and Assistant IDs updated",
    });
  };

  return {
    newThreadId,
    newAssistantId,
    isCreatingThread,
    isTestingThread,
    showAdvanced,
    isValidThread,
    setNewThreadId,
    setNewAssistantId,
    setIsCreatingThread,
    setIsTestingThread,
    setShowAdvanced,
    resetToDefaults,
    applyChanges
  };
}
