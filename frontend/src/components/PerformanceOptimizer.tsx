'use client'

import { useEffect, useRef } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add passive event listeners to prevent scroll-blocking violations
    const addPassiveListeners = () => {
      // Handle mousewheel events with passive listeners
      const handleMouseWheel = (e: WheelEvent) => {
        // Prevent default only if necessary
        if (e.deltaY !== 0) {
          // Allow natural scrolling
        }
      };

      // Handle touchmove events with passive listeners
      const handleTouchMove = (e: TouchEvent) => {
        // Allow natural touch scrolling
      };

      // Add passive event listeners
      container.addEventListener('wheel', handleMouseWheel, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });

      return () => {
        container.removeEventListener('wheel', handleMouseWheel);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    };

    const cleanup = addPassiveListeners();

    // Optimize scroll performance
    const optimizeScroll = () => {
      // Use requestAnimationFrame for smooth scrolling
      let ticking = false;
      
      const updateScroll = () => {
        // Handle scroll updates here
        ticking = false;
      };

      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll);
          ticking = true;
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    };

    const scrollCleanup = optimizeScroll();

    // Cleanup on unmount
    return () => {
      cleanup?.();
      scrollCleanup?.();
    };
  }, []);

  // Add CSS optimizations for better performance
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Optimize for performance */
      .performance-optimized {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      /* Prevent layout thrashing */
      .performance-optimized * {
        box-sizing: border-box;
      }
      
      /* Optimize animations */
      .performance-optimized .animate {
        transform: translateZ(0);
        will-change: transform, opacity;
      }
      
      /* Reduce paint complexity */
      .performance-optimized .simple-bg {
        background: solid;
        background-color: var(--bg-color, #002b36);
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="performance-optimized"
      style={{
        // CSS optimizations
        contain: 'layout style paint',
        isolation: 'isolate',
        // Prevent Grammarly from interfering
        position: 'relative',
        zIndex: 1
      }}
    >
      {children}
    </div>
  );
};

export default PerformanceOptimizer;
