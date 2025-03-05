
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useThreadDebugger } from "./useThreadDebugger";
import { ThreadDebuggerHeader } from "./ThreadDebuggerHeader";
import { ThreadIdInput } from "./ThreadIdInput";
import { AssistantIdInput } from "./AssistantIdInput";
import { SavedThreadsList } from "./SavedThreadsList";
import { TestResultDisplay } from "./TestResultDisplay";
import { InfoNotice } from "./InfoNotice";
import { ThreadDebuggerActions } from "./ThreadDebuggerActions";

export function ThreadDebugger() {
  const {
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
    setIsCreatingThread,
    setIsTestingThread,
    copyToClipboard,
    saveThread,
    removeThread,
    createNewThread,
    resetToDefaults,
    applyChanges,
    testThread
  } = useThreadDebugger();

  return (
    <Card className="bg-black/10 border-primary/20 backdrop-blur-sm shadow-sm">
      <CardHeader className="bg-primary/5 rounded-t-lg border-b border-primary/10 p-6">
        <ThreadDebuggerHeader 
          showAdvanced={showAdvanced} 
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)} 
        />
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <ThreadIdInput 
          threadId={newThreadId}
          isValidThread={isValidThread}
          isTestingThread={isTestingThread}
          onChange={setNewThreadId}
          onTest={testThread}
          onCopy={copyToClipboard}
        />

        <AssistantIdInput 
          assistantId={newAssistantId} 
          onChange={setNewAssistantId} 
        />

        {showAdvanced && (
          <>
            <Separator className="bg-white/5 my-6" />
            
            <SavedThreadsList 
              threads={savedThreads}
              threadName={threadName}
              currentThreadId={newThreadId}
              onNameChange={setThreadName}
              onSelect={setNewThreadId}
              onRemove={removeThread}
              onSave={saveThread}
            />
          </>
        )}

        <TestResultDisplay result={testResult} />

        <InfoNotice />
      </CardContent>
      
      <CardFooter className="p-0">
        <ThreadDebuggerActions 
          isCreatingThread={isCreatingThread}
          onResetDefaults={resetToDefaults}
          onCreateNewThread={createNewThread}
          onApplyChanges={applyChanges}
        />
      </CardFooter>
    </Card>
  );
}
