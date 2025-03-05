
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findMostSignificantCorrelations, CorrelationResult } from '@/utils/metrics/correlation';
import { useMetrics } from '@/hooks/useMetrics';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export function MetricsCorrelation() {
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const { registry } = useMetrics('global');
  
  useEffect(() => {
    // Subscribe to both domains to update correlations when metrics change
    const unsubscribeKeywords = registry.subscribe('keywords', () => {
      updateCorrelations();
    });
    
    const unsubscribeAppStore = registry.subscribe('appStore', () => {
      updateCorrelations();
    });
    
    // Initial calculation
    updateCorrelations();
    
    return () => {
      unsubscribeKeywords();
      unsubscribeAppStore();
    };
  }, [registry]);
  
  const updateCorrelations = () => {
    const results = findMostSignificantCorrelations(5);
    setCorrelations(results);
  };
  
  // If no correlations, don't render the component
  if (correlations.length === 0) {
    return null;
  }
  
  return (
    <Card className="bg-indigo-950/5 border-indigo-500/10 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white/90 text-lg">Cross-Domain Insights</CardTitle>
        <CardDescription className="text-white/60">
          Relationships between keywords and app performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {correlations.map((correlation, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/10">
              <div className="flex-1">
                <div className="text-sm text-white/70 mb-1">
                  {correlation.source.domain === 'keywords' ? 'Keyword' : 'App Metric'}
                </div>
                <div className="text-white font-medium">
                  {formatMetricName(correlation.source.key)}
                </div>
              </div>
              
              <div className="flex items-center px-3">
                {correlation.score > 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-400 mr-1" />
                )}
                <ArrowRight className="h-4 w-4 text-indigo-400 mx-2" />
              </div>
              
              <div className="flex-1 text-right">
                <div className="text-sm text-white/70 mb-1">
                  {correlation.target.domain === 'appStore' ? 'App Metric' : 'Keyword'}
                </div>
                <div className="text-white font-medium">
                  {formatMetricName(correlation.target.key)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-white/50 italic">
          Correlation confidence: {Math.round(correlations[0]?.significance * 100)}%
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format metric names for display
function formatMetricName(key: string): string {
  // Convert camelCase to Title Case
  const formatted = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase());
  
  // Special cases
  if (key.includes('opportunity')) return 'Opportunity Score';
  if (key.includes('difficulty')) return 'Keyword Difficulty';
  if (key.includes('volume')) return 'Search Volume';
  if (key.includes('downloads')) return 'App Downloads';
  if (key.includes('proceeds')) return 'App Revenue';
  if (key.includes('conversion')) return 'Conversion Rate';
  
  return formatted;
}
