
export * from './validation';
export * from './metrics';
export * from './distribution';
export * from './retention';

export const extractAppName = (data: any, analysisText: string): string => {
  const appNameMatch = data.app_name || analysisText.match(/App Name:\s*([^\n]+)/);
  return appNameMatch 
    ? (typeof appNameMatch === 'string' ? appNameMatch : appNameMatch[1].trim())
    : "Read-Along Books For Kids";
};
