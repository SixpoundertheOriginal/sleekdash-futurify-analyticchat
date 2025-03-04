
import { useState } from "react";
import { useThread, DEFAULT_THREAD_ID, DEFAULT_ASSISTANT_ID } from "@/contexts/ThreadContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, CheckCircle, XCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ThreadDebugger() {
  const { threadId, assistantId, setThreadId, setAssistantId, isValidThread } = useThread();
  const [newThreadId, setNewThreadId] = useState(threadId);
  const [newAssistantId, setNewAssistantId] = useState(assistantId);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isTestingThread, setIsTestingThread] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const { toast } = useToast();

  const createNewThread = async () => {
    setIsCreatingThread(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-thread', {
        body: {}
      });

      if (error) throw error;
      if (!data?.threadId) throw new Error('No thread ID returned');

      setNewThreadId(data.threadId);
      setThreadId(data.threadId);
      
      toast({
        title: "Success",
        description: `New thread created: ${data.threadId}`,
      });
    } catch (error) {
      console.error('Error creating thread:', error);
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

  const testThread = async () => {
    setIsTestingThread(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-message', {
        body: { 
          message: "This is a test message for thread validation.",
          threadId: newThreadId,
          assistantId: newAssistantId
        }
      });

      if (error) throw error;
      if (!data?.analysis) throw new Error('No response received');

      setTestResult("success");
      toast({
        title: "Test Successful",
        description: "Thread and Assistant are working correctly",
      });
    } catch (error) {
      console.error('Thread test error:', error);
      setTestResult("error");
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: `Thread test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestingThread(false);
    }
  };

  return (
    <Card className="bg-black/20 border-primary/20 backdrop-blur-sm">
      <CardHeader className="bg-primary/10 rounded-t-lg border-b border-primary/20">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Thread Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Current Thread:</span>
            <Badge 
              variant={isValidThread ? "default" : "destructive"}
              className="px-2 py-0.5 flex items-center gap-1"
            >
              {isValidThread ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mr-1" />
              )}
              {isValidThread ? "Valid" : "Invalid"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              value={newThreadId} 
              onChange={(e) => setNewThreadId(e.target.value)} 
              placeholder="Thread ID"
              className="bg-black/30 border-white/10 text-white"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white"
              onClick={testThread}
              disabled={isTestingThread}
            >
              {isTestingThread ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Test"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Assistant ID:</span>
          </div>
          <Input 
            value={newAssistantId} 
            onChange={(e) => setNewAssistantId(e.target.value)} 
            placeholder="Assistant ID"
            className="bg-black/30 border-white/10 text-white"
          />
        </div>

        {testResult && (
          <div className={`p-3 rounded-md flex items-center gap-2 ${
            testResult === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            {testResult === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {testResult === "success" 
              ? "Thread and Assistant verified successfully!" 
              : "Thread test failed. Check console for details."}
          </div>
        )}

        <div className="mt-2 p-2 bg-amber-500/10 rounded-md flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300/90">
            When you create a new thread, the conversation history starts fresh. 
            Use this tool only for debugging thread-related issues.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/10 p-4 bg-black/20">
        <Button
          variant="outline"
          size="sm"
          className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-white"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-primary/20 border-primary/30 hover:bg-primary/30 text-white"
            onClick={createNewThread}
            disabled={isCreatingThread}
          >
            {isCreatingThread ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Create New Thread
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={applyChanges}
          >
            Apply Changes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
