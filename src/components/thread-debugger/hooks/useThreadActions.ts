
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TestResult } from "../types";

export interface UseThreadActionsReturn {
  copyToClipboard: (text: string) => void;
  createNewThread: (
    setIsCreatingThread: (value: boolean) => void,
    setTestResult: (result: TestResult) => void,
    setNewThreadId: (id: string) => void
  ) => Promise<string | null>;
  testThread: (
    threadId: string,
    assistantId: string,
    setIsTestingThread: (value: boolean) => void,
    setTestResult: (result: TestResult) => void
  ) => Promise<boolean>;
}

export function useThreadActions(): UseThreadActionsReturn {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const createNewThread = async (
    setIsCreatingThread: (value: boolean) => void,
    setTestResult: (result: TestResult) => void,
    setNewThreadId: (id: string) => void
  ): Promise<string | null> => {
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
      return data.threadId;
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
      return null;
    } finally {
      setIsCreatingThread(false);
    }
  };

  const testThread = async (
    newThreadId: string,
    newAssistantId: string,
    setIsTestingThread: (value: boolean) => void,
    setTestResult: (result: TestResult) => void
  ): Promise<boolean> => {
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
        return false;
      }

      setTestResult({ status: "success", details: null });
      toast({
        title: "Test Successful",
        description: "Thread and Assistant are working correctly",
      });
      return true;
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
      return false;
    } finally {
      setIsTestingThread(false);
    }
  };

  return {
    copyToClipboard,
    createNewThread,
    testThread
  };
}
