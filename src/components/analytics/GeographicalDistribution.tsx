
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ProcessedAnalytics } from "@/utils/analytics/processAnalysis";
import { useRef, useState, useEffect, KeyboardEvent } from "react";

interface GeographicalDistributionProps {
  data: ProcessedAnalytics;
}

export function GeographicalDistribution({ data }: GeographicalDistributionProps) {
  const COLORS = ['#9b87f5', '#7F9CF5', '#4C51BF', '#6366F1'];
  const chartRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Accessible table representation of the data
  const tableData = data.geographical.markets.map((market, index) => ({
    country: market.country,
    downloads: market.downloads,
    percentage: ((market.downloads / data.acquisition.downloads.value) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (data.geographical.markets.length === 0) return;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev === data.geographical.markets.length - 1 ? 0 : prev + 1
        );
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev <= 0 ? data.geographical.markets.length - 1 : prev - 1
        );
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(data.geographical.markets.length - 1);
        break;
      default:
        break;
    }
  };

  // Announce focused item for screen readers
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < data.geographical.markets.length) {
      const market = data.geographical.markets[focusedIndex];
      const percentage = ((market.downloads / data.acquisition.downloads.value) * 100).toFixed(1);
      
      // Update ARIA live region
      const liveRegion = document.getElementById('geo-chart-live-region');
      if (liveRegion) {
        liveRegion.textContent = `${market.country}: ${percentage}% of downloads, ${market.downloads} total downloads`;
      }
    }
  }, [focusedIndex, data.geographical.markets, data.acquisition.downloads.value]);

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="font-semibold text-white mb-4" id="geo-distribution-title">Downloads by Country</h3>
      
      {/* Screen reader announcements */}
      <div 
        id="geo-chart-live-region" 
        aria-live="polite" 
        className="sr-only"
        aria-atomic="true"
      >
        {focusedIndex >= 0 && focusedIndex < data.geographical.markets.length ? 
          `${data.geographical.markets[focusedIndex].country}: ${((data.geographical.markets[focusedIndex].downloads / data.acquisition.downloads.value) * 100).toFixed(1)}% of downloads` 
          : 'Geographical distribution of app downloads. Use arrow keys to navigate between countries.'}
      </div>
      
      {/* Screen reader only instructions */}
      <div className="sr-only" id="geo-chart-instructions">
        Use arrow keys to navigate between countries. Press Home to go to the first country and End to go to the last country.
      </div>
      
      {/* Screen reader only table with the data */}
      <div className="sr-only">
        <table aria-labelledby="geo-distribution-title">
          <caption>Geographical distribution of app downloads</caption>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Downloads</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, i) => (
              <tr key={i}>
                <td>{item.country}</td>
                <td>{item.downloads}</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div 
        className="h-[300px]" 
        ref={chartRef}
        role="figure"
        aria-labelledby="geo-distribution-title"
        aria-describedby="geo-chart-instructions"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-activedescendant={focusedIndex >= 0 ? `geo-segment-${focusedIndex}` : undefined}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.geographical.markets}
              dataKey="downloads"
              nameKey="country"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ country, percent }) => `${country} ${(percent * 100).toFixed(1)}%`}
            >
              {data.geographical.markets.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={focusedIndex === index ? "#ffffff" : "none"}
                  strokeWidth={focusedIndex === index ? 2 : 0}
                  id={`geo-segment-${index}`}
                  aria-label={`${entry.country}: ${((entry.downloads / data.acquisition.downloads.value) * 100).toFixed(1)}% of downloads, ${entry.downloads} total downloads`}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Visible data representation for better accessibility */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
        {tableData.map((item, i) => (
          <div 
            key={i} 
            className={`flex items-center gap-2 p-1 rounded ${focusedIndex === i ? 'bg-white/10' : ''}`}
            aria-selected={focusedIndex === i}
            id={`geo-legend-${i}`}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-white/90">{item.country}: </span>
            <span className="text-white font-medium">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
