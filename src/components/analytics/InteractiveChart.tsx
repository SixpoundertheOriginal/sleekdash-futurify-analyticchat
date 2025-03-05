
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { InteractiveTooltip } from '@/components/ui/interactive-tooltip';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar
} from 'recharts';

// Define the CategoricalChartState type since it's not exported by recharts
interface CategoricalChartState {
  activeCoordinate?: {
    x: number;
    y: number;
  };
  activePayload?: Array<any>;
  activeTooltipIndex?: number;
  chartX?: number;
  chartY?: number;
}

interface DataPoint {
  [key: string]: any;
}

interface InteractiveChartProps {
  data: DataPoint[];
  type: 'line' | 'bar';
  xKey: string;
  yKeys: {
    key: string;
    color: string;
    name: string;
  }[];
  height?: number;
  formatter?: (value: any, index?: any) => string;
  isAnimated?: boolean;
  showGrid?: boolean;
  onPointHover?: (point: DataPoint | null) => void;
}

export function InteractiveChart({
  data,
  type,
  xKey,
  yKeys,
  height = 300,
  formatter,
  isAnimated = true,
  showGrid = true,
  onPointHover
}: InteractiveChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  // Simulate sequential data loading for animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (state: CategoricalChartState) => {
    if (!containerRef.current || !data.length || !state.activeCoordinate) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const xPosition = state.activeCoordinate.x;
    const xRatio = xPosition / containerRect.width;
    const dataIndex = Math.floor(xRatio * data.length);
    
    if (dataIndex >= 0 && dataIndex < data.length) {
      setActiveIndex(dataIndex);
      onPointHover?.(data[dataIndex]);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    setIsHovering(false);
    onPointHover?.(null);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Custom tooltip that follows cursor
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 p-3 rounded-lg border border-white/10 shadow-lg backdrop-blur-md">
          <p className="font-display text-white font-medium mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <p className="text-white/80 font-mono text-xs">
                  {entry.name}: {formatter 
                    ? formatter(entry.value) 
                    : entry.value
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave, 
      onMouseEnter: handleMouseEnter
    };

    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          )}
          <XAxis 
            dataKey={xKey} 
            tick={{ fill: '#9ca3af' }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis 
            tick={{ fill: '#9ca3af' }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={formatter}
          />
          <Tooltip 
            content={<CustomTooltipContent />}
            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          {yKeys.map((y, i) => (
            <Line 
              key={y.key}
              type="monotone"
              dataKey={y.key}
              stroke={y.color}
              strokeWidth={2}
              name={y.name}
              dot={{ 
                r: 4, 
                strokeWidth: 1, 
                fill: 'var(--background)', 
                stroke: y.color 
              }}
              activeDot={{ 
                r: activeIndex !== null ? 6 : 4, 
                strokeWidth: 2,
                stroke: '#fff',
                fill: y.color
              }}
              isAnimationActive={isAnimated}
            />
          ))}
        </LineChart>
      );
    }
    
    return (
      <BarChart {...commonProps}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        )}
        <XAxis 
          dataKey={xKey} 
          tick={{ fill: '#9ca3af' }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis 
          tick={{ fill: '#9ca3af' }} 
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={formatter}
        />
        <Tooltip 
          content={<CustomTooltipContent />}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        {yKeys.map((y, i) => (
          <Bar
            key={y.key}
            dataKey={y.key}
            fill={y.color}
            name={y.name}
            radius={[4, 4, 0, 0]}
            isAnimationActive={isAnimated}
          />
        ))}
      </BarChart>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full touch-none"
      style={{ height }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: hasRendered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </motion.div>
      
      {activeIndex !== null && data[activeIndex] && (
        <motion.div
          className="absolute bottom-0 h-full pointer-events-none"
          style={{ 
            left: `${(activeIndex / (data.length - 1)) * 100}%`,
            transform: 'translateX(-50%)'
          }}
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-px h-full bg-white/30" />
        </motion.div>
      )}
    </div>
  );
}
