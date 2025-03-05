
import { ProcessedAnalytics } from './types';

// Key for localStorage
const ANALYTICS_STORAGE_KEY = 'app_store_analytics_data';

/**
 * Save processed analytics data to localStorage
 */
export const saveAnalyticsToStorage = (data: ProcessedAnalytics): void => {
  try {
    // Ensure the data has non-zero values for at least one key metric
    const hasValidData = 
      data.acquisition.downloads.value > 0 ||
      data.financial.proceeds.value > 0 ||
      data.acquisition.conversionRate.value > 0 ||
      data.technical.crashes.value > 0;
    
    if (!hasValidData) {
      console.warn('Cannot save analytics data: No valid metrics found');
      return;
    }
    
    // Add timestamp for when this data was saved
    const dataWithTimestamp = {
      ...data,
      _savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(dataWithTimestamp));
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
    
    const parsedData = JSON.parse(storedData) as (ProcessedAnalytics & { _savedAt?: string });
    console.log('Analytics data retrieved from localStorage, saved at:', parsedData._savedAt || 'unknown time');
    
    // Check if we have at least one valid metric
    const hasValidData = 
      parsedData.acquisition.downloads.value > 0 ||
      parsedData.financial.proceeds.value > 0 ||
      parsedData.acquisition.conversionRate.value > 0 ||
      parsedData.technical.crashes.value > 0;
    
    if (!hasValidData) {
      console.warn('Retrieved data has no valid metrics');
      return null;
    }
    
    // Remove the timestamp before returning
    const { _savedAt, ...cleanData } = parsedData;
    return cleanData as ProcessedAnalytics;
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
