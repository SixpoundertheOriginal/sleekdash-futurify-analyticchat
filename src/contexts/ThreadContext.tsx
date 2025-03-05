
// This file re-exports everything from the new thread context structure
// for backward compatibility
export {
  ThreadProvider,
  useThread,
  DEFAULT_THREAD_ID,
  DEFAULT_ASSISTANT_ID,
  APP_STORE_ASSISTANT_ID
} from './thread/ThreadContext';

// Type exports for backward compatibility
export type { } from './thread/ThreadContext';
