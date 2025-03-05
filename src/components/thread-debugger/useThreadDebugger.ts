
import { useThreadState } from "./hooks/useThreadState";
import { useTestResult } from "./hooks/useTestResult";
import { useSavedThreads } from "./hooks/useSavedThreads";
import { useThreadActions } from "./hooks/useThreadActions";

export function useThreadDebugger() {
  const {
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
  } = useThreadState();

  const { testResult, setTestResult, clearTestResult } = useTestResult();
  
  const {
    savedThreads,
    threadName,
    setThreadName,
    saveThread,
    removeThread
  } = useSavedThreads();

  const { copyToClipboard, createNewThread, testThread } = useThreadActions();

  const handleCreateNewThread = async () => {
    await createNewThread(setIsCreatingThread, setTestResult, setNewThreadId);
  };

  const handleTestThread = async () => {
    await testThread(newThreadId, newAssistantId, setIsTestingThread, setTestResult);
  };

  const handleSaveThread = () => {
    saveThread(newThreadId);
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
    saveThread: handleSaveThread,
    removeThread,
    createNewThread: handleCreateNewThread,
    resetToDefaults,
    applyChanges,
    testThread: handleTestThread
  };
}
