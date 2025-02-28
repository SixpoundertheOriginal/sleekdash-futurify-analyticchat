
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeywordMetric, ProcessedKeywordData } from '@/components/keywords/types';
import { useToast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

// Type definitions for raw data and analysis
interface RawKeywordAnalysis {
  prioritized_keywords: Array<{
    keyword: string;
    volume?: number;
    difficulty?: number;
    kei?: number;
    relevancy?: number;
    chance?: number;
    growth?: number;
  }>;
  openai_analysis: string;
  created_at: string;
  user_id: string;
}

// Process raw data into the format needed for visualizations
const processKeywordData = (rawData: any | null): KeywordMetric[] => {
  if (!rawData?.prioritized_keywords) return [];
  
  const keywords = rawData.prioritized_keywords;
  if (!Array.isArray(keywords)) return [];
  
  return keywords.map((keyword: any) => ({
    keyword: keyword.keyword || '',
    volume: Number(keyword.volume) || 0,
    difficulty: Number(keyword.difficulty) || 0,
    kei: Number(keyword.kei) || 0,
    relevancy: Number(keyword.relevancy) || 0,
    chance: Number(keyword.chance) || 0,
    growth: Number(keyword.growth) || 0
  }));
};

export function useKeywordAnalytics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch keyword data function
  const fetchKeywordData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('keyword_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching keyword data:', error);
      throw error;
    }

    // Type assertion to handle the Json type from Supabase
    const rawData = data as unknown as RawKeywordAnalysis;
    return rawData;
  }, []);

  // Set up real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('keyword_analytics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keyword_analyses',
        },
        async (payload) => {
          console.log('New keyword analysis received:', payload);
          
          // Invalidate and refetch queries
          await queryClient.invalidateQueries({ queryKey: ['keywordAnalysis'] });
          
          toast({
            title: "New analysis available",
            description: "The dashboard has been updated with new keyword data."
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  // Use React Query for data fetching and caching
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['keywordAnalysis'],
    queryFn: fetchKeywordData,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    meta: {
      onError: (err: Error) => {
        toast({
          variant: "destructive",
          title: "Error fetching keyword data",
          description: err.message || "Please try refreshing the page."
        });
      }
    }
  });

  // Set up real-time subscription on mount
  useCallback(() => {
    const unsubscribe = setupRealtimeSubscription();
    return () => unsubscribe();
  }, [setupRealtimeSubscription]);

  // Process data and calculate metrics
  const keywordData = processKeywordData(rawData);
  const processedData: ProcessedKeywordData[] = keywordData.map(item => ({
    ...item,
    opportunityScore: (item.kei * item.chance / Math.max(1, item.difficulty)) * 10
  }));

  const sortedByOpportunity = [...processedData].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const avgVolume = Math.round(keywordData.reduce((sum, item) => sum + item.volume, 0) / keywordData.length || 0);
  const avgDifficulty = Math.round(keywordData.reduce((sum, item) => sum + item.difficulty, 0) / keywordData.length || 0);

  return {
    isLoading,
    error,
    keywordData: processedData,
    topOpportunity: sortedByOpportunity[0],
    keywordCount: keywordData.length,
    avgVolume,
    avgDifficulty,
    refreshData: () => queryClient.invalidateQueries({ queryKey: ['keywordAnalysis'] })
  };
}
