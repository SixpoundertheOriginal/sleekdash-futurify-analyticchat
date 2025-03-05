
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
  followCursor?: boolean;
  showArrow?: boolean;
}

export function InteractiveTooltip({ 
  children, 
  content, 
  delay = 200, 
  followCursor = false,
  showArrow = true
}: InteractiveTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, delay / 2);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!followCursor || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });
  };

  // Calculate position on initial render for non-following tooltips
  useEffect(() => {
    if (!containerRef.current || followCursor) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({ 
      x: rect.width / 2, 
      y: 0 
    });
  }, [followCursor]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className="absolute z-50 pointer-events-none"
            style={{
              left: followCursor ? position.x : '50%',
              top: followCursor ? position.y - 10 : '-10px',
              transform: followCursor ? 'translate(-50%, -100%)' : 'translate(-50%, -100%)',
            }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-gradient-to-br from-black/90 to-black/80 backdrop-blur-lg text-white rounded-lg p-3 shadow-lg border border-white/10 min-w-[150px] max-w-[300px]">
              {content}
            </div>
            {showArrow && (
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-l-transparent border-r-transparent border-t-black/80 mx-auto mt-[-1px]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
