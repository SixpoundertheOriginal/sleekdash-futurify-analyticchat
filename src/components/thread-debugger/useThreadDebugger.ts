
import { useState, useEffect } from "react";
import { useThread, DEFAULT_THREAD_ID, DEFAULT_ASSISTANT_ID } from "@/contexts/ThreadContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SavedThread, TestResult } from "./types";

export function useThreadDebugger() {
  const { threadId, assistantId, setThreadId, setAssistantId, isValidThread } = useThread();
  const [newThreadId, setNewThreadId] = useState(threadId);
  const [newAssistantId, setNewAssistantId] = useState(assistantId);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isTestingThread, setIsTestingThread] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>({ status: null, details: null });
  const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
  const [threadName, setThreadName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const saveThread = () => {
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

  const createNewThread = async () => {
    setIsCreatingThread(true);
    setTestResult({ status: null, details: null });
    
    try {
      console.log('Creating new thread...');
      const { data, error } = await supabase.functions.invoke('create-thread', {
        body: {}
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from edge function');
      }
      
      if (!data.threadId) {
        console.error('Invalid response:', data);
        throw new Error('No thread ID returned in response');
      }

      console.log('Thread created successfully:', data.threadId);
      setNewThreadId(data.threadId);
      
      toast({
        title: "Success",
        description: `New thread created: ${data.threadId}`,
      });
      
      setTestResult({ status: "success", details: null });
    } catch (error) {
      console.error('Error creating thread:', error);
      setTestResult({ 
        status: "error", 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsCreatingThread(false);
    }
  };

  const resetToDefaults = () => {
    setNewThreadId(DEFAULT_THREAD_ID);
    setNewAssistantId(DEFAULT_ASSISTANT_ID);
    setThreadId(DEFAULT_THREAD_ID);
    setAssistantId(DEFAULT_ASSISTANT_ID);
    setTestResult({ status: null, details: null });
    toast({
      title: "Reset Complete",
      description: "Thread and Assistant IDs reset to defaults",
    });
  };

  const applyChanges = () => {
    setThreadId(newThreadId);
    setAssistantId(newAssistantId);
    setTestResult({ status: null, details: null });
    toast({
      title: "Changes Applied",
      description: "Thread and Assistant IDs updated",
    });
  };

  const testThread = async () => {
    setIsTestingThread(true);
    setTestResult({ status: null, details: null });
    
    try {
      console.log('Testing thread:', newThreadId);
      console.log('Testing assistant:', newAssistantId);
      
      const { data, error } = await supabase.functions.invoke('test-thread', {
        body: { 
          threadId: newThreadId,
          assistantId: newAssistantId
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('Test response:', data);
      
      if (!data.success) {
        setTestResult({ 
          status: "error", 
          details: data.error || 'Unknown error'
        });
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: data.error || 'Thread validation failed'
        });
        return;
      }

      setTestResult({ status: "success", details: null });
      toast({
        title: "Test Successful",
        description: "Thread and Assistant are working correctly",
      });
    } catch (error) {
      console.error('Thread test error:', error);
      setTestResult({ 
        status: "error", 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: `Thread test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestingThread(false);
    }
  };

  return {
    newThreadId,
    newAssistantId,
    isCreatingThread,
    isTestingThread,
    testResult,
    savedThreads,
    threadName,
    showAdvanced,
    isValidThread,
    setNewThreadId,
    setNewAssistantId,
    setThreadName,
    setShowAdvanced,
    copyToClipboard,
    saveThread,
    removeThread,
    createNewThread,
    resetToDefaults,
    applyChanges,
    testThread
  };
}
