
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics } from './dashboard/DashboardMetrics';
import { RetentionChart } from './dashboard/RetentionChart';
import { GeographicalDistribution } from './dashboard/GeographicalDistribution';

export function AnalyticsDashboard() {
  const queryClient = useQueryClient();

  const { data: analysisResults } = useQuery({
    queryKey: ['analysisResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Parse JSON strings back to objects
      return data ? {
        ...data,
        performance_metrics: JSON.parse(data.performance_metrics as string || '[]'),
        device_distribution: JSON.parse(data.device_distribution as string || '[]'),
        geographical_data: JSON.parse(data.geographical_data as string || '[]'),
        retention_data: JSON.parse(data.retention_data as string || '[]'),
      } : null;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('analysis_results_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analysis_results'
        },
        (payload) => {
          console.log('New analysis result received:', payload);
          queryClient.invalidateQueries({ queryKey: ['analysisResults'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (!analysisResults) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Add loading states here if needed */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardMetrics metrics={analysisResults.performance_metrics} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RetentionChart retentionData={analysisResults.retention_data} />
        <GeographicalDistribution geoData={analysisResults.geographical_data} />
      </div>
    </div>
  );
}
