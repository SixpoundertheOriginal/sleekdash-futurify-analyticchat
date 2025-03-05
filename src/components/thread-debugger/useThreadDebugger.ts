
import { useThreadState, UseThreadStateReturn } from "./hooks/useThreadState";
import { useTestResult, UseTestResultReturn } from "./hooks/useTestResult";
import { useSavedThreads, UseSavedThreadsReturn } from "./hooks/useSavedThreads";
import { useThreadOperations } from "./hooks/useThreadOperations";

export interface UseThreadDebuggerReturn extends Omit<
  UseThreadStateReturn & 
  UseTestResultReturn & 
  Pick<UseSavedThreadsReturn, 'savedThreads' | 'threadName' | 'setThreadName'>, 
  'saveThread' | 'removeThread'
> {
  saveThread: () => void;
  removeThread: (id: string) => void;
  createNewThread: () => Promise<void>;
  testThread: () => Promise<void>;
  copyToClipboard: (text: string) => void;
  setIsCreatingThread: (isCreating: boolean) => void;
  setIsTestingThread: (isTesting: boolean) => void;
}

export function useThreadDebugger(): UseThreadDebuggerReturn {
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
    saveThread: originalSaveThread,
    removeThread
  } = useSavedThreads();

  const { copyToClipboard, createNewThread: originalCreateNewThread, testThread: originalTestThread } = useThreadOperations();

  const handleCreateNewThread = async () => {
    await originalCreateNewThread(setIsCreatingThread, setTestResult, setNewThreadId);
  };

  const handleTestThread = async () => {
    await originalTestThread(newThreadId, newAssistantId, setIsTestingThread, setTestResult);
  };

  const handleSaveThread = () => {
    originalSaveThread(newThreadId);
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
    setIsCreatingThread,
    setIsTestingThread,
    copyToClipboard,
    saveThread: handleSaveThread,
    removeThread,
    createNewThread: handleCreateNewThread,
    resetToDefaults,
    applyChanges,
    testThread: handleTestThread,
    setTestResult,
    clearTestResult
  };
}
