
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SavedThread } from "../types";

export function useSavedThreads() {
  const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
  const [threadName, setThreadName] = useState('');
  const { toast } = useToast();

  // Load saved threads from localStorage on mount
  useEffect(() => {
    const savedThreadsStr = localStorage.getItem('savedThreads');
    if (savedThreadsStr) {
      try {
        const threads = JSON.parse(savedThreadsStr);
        if (Array.isArray(threads)) {
          setSavedThreads(threads);
        }
      } catch (e) {
        console.error('Failed to parse saved threads', e);
      }
    }
  }, []);

  const saveThread = (newThreadId: string) => {
    if (!newThreadId || !threadName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Thread ID and name are required"
      });
      return;
    }
    
    const newSavedThreads = [...savedThreads, { id: newThreadId, name: threadName }];
    setSavedThreads(newSavedThreads);
    localStorage.setItem('savedThreads', JSON.stringify(newSavedThreads));
    
    toast({
      title: "Thread Saved",
      description: `Thread "${threadName}" saved for future use`,
    });
    
    setThreadName('');
  };

  const removeThread = (id: string) => {
    const newSavedThreads = savedThreads.filter(thread => thread.id !== id);
    setSavedThreads(newSavedThreads);
    localStorage.setItem('savedThreads', JSON.stringify(newSavedThreads));
    
    toast({
      title: "Thread Removed",
      description: "Thread removed from saved list",
    });
  };

  return {
    savedThreads,
    threadName,
    setThreadName,
    saveThread,
    removeThread
  };
}
