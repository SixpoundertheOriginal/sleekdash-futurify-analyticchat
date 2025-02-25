
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KeywordMetric, ProcessedKeywordData } from '@/components/keywords/types';
import { useToast } from '@/components/ui/use-toast';

export function useKeywordAnalytics() {
  const [keywordData, setKeywordData] = useState<KeywordMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Process raw data into the format needed for visualizations
  const processKeywordData = (rawData: any): KeywordMetric[] => {
    if (!rawData?.prioritized_keywords) return [];
    
    return rawData.prioritized_keywords.map((keyword: any) => ({
      keyword: keyword.keyword,
      volume: keyword.volume || 0,
      difficulty: keyword.difficulty || 0,
      kei: keyword.kei || 0,
      relevancy: keyword.relevancy || 0,
      chance: keyword.chance || 0,
      growth: keyword.growth || 0
    }));
  };

  // Fetch initial data
  const fetchKeywordData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('keyword_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching keyword data:', error);
        return;
      }

      if (data) {
        const processedData = processKeywordData(data);
        setKeywordData(processedData);
      }
    } catch (error) {
      console.error('Error in fetchKeywordData:', error);
      toast({
        variant: "destructive",
        title: "Error fetching keyword data",
        description: "Please try refreshing the page."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    fetchKeywordData();

    const channel = supabase
      .channel('keyword_analytics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keyword_analyses',
        },
        (payload) => {
          console.log('New keyword analysis received:', payload);
          const processedData = processKeywordData(payload.new);
          setKeywordData(processedData);
          
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
  }, []);

  // Calculate additional metrics for visualizations
  const processedData: ProcessedKeywordData[] = keywordData.map(item => ({
    ...item,
    opportunityScore: (item.kei * item.chance / Math.max(1, item.difficulty)) * 10
  }));

  const sortedByOpportunity = [...processedData].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const avgVolume = Math.round(keywordData.reduce((sum, item) => sum + item.volume, 0) / keywordData.length || 0);
  const avgDifficulty = Math.round(keywordData.reduce((sum, item) => sum + item.difficulty, 0) / keywordData.length || 0);

  return {
    isLoading,
    keywordData: processedData,
    topOpportunity: sortedByOpportunity[0],
    keywordCount: keywordData.length,
    avgVolume,
    avgDifficulty
  };
}
