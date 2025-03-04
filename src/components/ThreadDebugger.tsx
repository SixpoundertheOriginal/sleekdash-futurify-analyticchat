
import { useState, useEffect } from "react";
import { useThread, DEFAULT_THREAD_ID, DEFAULT_ASSISTANT_ID } from "@/contexts/ThreadContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, CheckCircle, XCircle, Info, AlertTriangle, Copy, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ThreadDebugger() {
  const { threadId, assistantId, setThreadId, setAssistantId, isValidThread } = useThread();
  const [newThreadId, setNewThreadId] = useState(threadId);
  const [newAssistantId, setNewAssistantId] = useState(assistantId);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isTestingThread, setIsTestingThread] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [savedThreads, setSavedThreads] = useState<{id: string, name: string}[]>([]);
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
  
  // Save a thread to localStorage
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
  
  // Remove a saved thread
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
    setTestResult(null);
    setErrorDetails(null);
    
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
      
      setTestResult("success");
    } catch (error) {
      console.error('Error creating thread:', error);
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      setTestResult("error");
      
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
    setTestResult(null);
    setErrorDetails(null);
    toast({
      title: "Reset Complete",
      description: "Thread and Assistant IDs reset to defaults",
    });
  };

  const applyChanges = () => {
    setThreadId(newThreadId);
    setAssistantId(newAssistantId);
    setTestResult(null);
    setErrorDetails(null);
    toast({
      title: "Changes Applied",
      description: "Thread and Assistant IDs updated",
    });
  };

  const testThread = async () => {
    setIsTestingThread(true);
    setTestResult(null);
    setErrorDetails(null);
    
    try {
      console.log('Testing thread:', newThreadId);
      console.log('Testing assistant:', newAssistantId);
      
      // Use the dedicated test-thread function for more detailed diagnostics
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
        setTestResult("error");
        setErrorDetails(data.error || 'Unknown error');
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: data.error || 'Thread validation failed'
        });
        return;
      }

      setTestResult("success");
      toast({
        title: "Test Successful",
        description: "Thread and Assistant are working correctly",
      });
    } catch (error) {
      console.error('Thread test error:', error);
      setTestResult("error");
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
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
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Thread Debugger
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-white/60 hover:text-white"
          >
            {showAdvanced ? "Simple Mode" : "Advanced Mode"}
          </Button>
        </div>
        <CardDescription className="text-white/60">
          Diagnose and fix thread-related issues
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Thread ID:</span>
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
            <div className="flex-1 flex items-center relative">
              <Input 
                value={newThreadId} 
                onChange={(e) => setNewThreadId(e.target.value)} 
                placeholder="Thread ID"
                className="bg-black/30 border-white/10 text-white pr-8"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 text-white/60 hover:text-white"
                onClick={() => copyToClipboard(newThreadId)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
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

        {showAdvanced && (
          <>
            <Separator className="bg-white/10" />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Saved Threads:</span>
                {savedThreads.length > 0 && (
                  <Badge className="bg-primary/30 text-white">{savedThreads.length}</Badge>
                )}
              </div>
              
              {savedThreads.length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {savedThreads.map((thread) => (
                    <div 
                      key={thread.id} 
                      className="flex items-center justify-between gap-2 p-2 bg-black/20 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{thread.name}</p>
                        <p className="text-white/60 text-xs truncate">{thread.id}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-primary/20"
                          onClick={() => {
                            setNewThreadId(thread.id);
                            setTestResult(null);
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => removeThread(thread.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-black/20 text-white/60 text-sm rounded-md text-center">
                  No saved threads. Save threads for quick access.
                </div>
              )}
              
              <div className="pt-2 flex items-center gap-2">
                <Input
                  value={threadName}
                  onChange={(e) => setThreadName(e.target.value)}
                  placeholder="Thread name"
                  className="bg-black/30 border-white/10 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap bg-primary/20 border-primary/30 hover:bg-primary/30 text-white"
                  onClick={saveThread}
                  disabled={!newThreadId || !threadName}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </>
        )}

        {testResult && (
          <div className={`p-3 rounded-md flex flex-col gap-2 ${
            testResult === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            <div className="flex items-center gap-2">
              {testResult === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <p>
                {testResult === "success" 
                  ? "Thread and Assistant verified successfully!" 
                  : "Thread test failed. See details below:"}
              </p>
            </div>
            
            {testResult === "error" && errorDetails && (
              <div className="mt-2 p-2 bg-black/20 rounded-md overflow-auto text-xs text-white/80 max-h-[150px]">
                <pre>{errorDetails}</pre>
              </div>
            )}
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
