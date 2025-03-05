
import { ProcessedAnalytics } from './types';

// Key for localStorage
const ANALYTICS_STORAGE_KEY = 'app_store_analytics_data';

/**
 * Save processed analytics data to localStorage
 */
export const saveAnalyticsToStorage = (data: ProcessedAnalytics): void => {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    console.log('Analytics data saved to localStorage');
  } catch (error) {
    console.error('Error saving analytics data to localStorage:', error);
  }
};

/**
 * Retrieve processed analytics data from localStorage
 */
export const getAnalyticsFromStorage = (): ProcessedAnalytics | null => {
  try {
    const storedData = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!storedData) {
      console.log('No analytics data found in localStorage');
      return null;
    }
    
    const parsedData = JSON.parse(storedData) as ProcessedAnalytics;
    console.log('Analytics data retrieved from localStorage');
    return parsedData;
  } catch (error) {
    console.error('Error retrieving analytics data from localStorage:', error);
    return null;
  }
};

/**
 * Clear analytics data from localStorage
 */
export const clearAnalyticsStorage = (): void => {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    console.log('Analytics data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing analytics data from localStorage:', error);
  }
};
