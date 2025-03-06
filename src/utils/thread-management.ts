
// This file manages thread-related functionality
export type AssistantType = 'general' | 'keywords' | 'appStore' | 'marketing' | 'appEvents' | 'croTesting';

// Helper function to get assistant ID for a feature
export const getAssistantIdForFeature = (feature: AssistantType): string => {
  const assistantIds: Record<AssistantType, string> = {
    general: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    keywords: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    appStore: 'asst_TfGVD0dcL2vsnPCihybxorC7',
    marketing: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    appEvents: 'asst_EYm70EgIE2okxc8onNc1DVTj',
    croTesting: 'asst_EYm70EgIE2okxc8onNc1DVTj',
  };
  
  return assistantIds[feature] || assistantIds.general;
};

// Helper to get default thread ID for a feature
export const getDefaultThreadIdForFeature = (feature: AssistantType): string => {
  const defaultThreadIds: Record<AssistantType, string> = {
    general: 'thread_XexaKEggRcir8kQLQbbLqqy9',
    keywords: 'thread_XexaKEggRcir8kQLQbbLqqy9',
    appStore: 'thread_d5BLFmp47v8EbWacFTjs6sgh',
    marketing: 'thread_XexaKEggRcir8kQLQbbLqqy9',
    appEvents: 'thread_XexaKEggRcir8kQLQbbLqqy9',
    croTesting: 'thread_XexaKEggRcir8kQLQbbLqqy9',
  };
  
  return defaultThreadIds[feature] || defaultThreadIds.general;
};
