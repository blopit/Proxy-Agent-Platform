import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  jank: number;
}

export function usePerformance(
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void,
  sampleSize = 60
) {
  const metricsRef = useRef({
    frames: [] as number[],
    lastFrameTime: performance.now(),
    jankCount: 0,
  });

  useEffect(() => {
    let animationFrame: number;
    const TARGET_FRAME_TIME = 1000 / 60; // 60 FPS

    function measureFrame() {
      const now = performance.now();
      const frameTime = now - metricsRef.current.lastFrameTime;
      
      // Update metrics
      metricsRef.current.frames.push(frameTime);
      if (metricsRef.current.frames.length > sampleSize) {
        metricsRef.current.frames.shift();
      }

      // Check for jank (frames taking significantly longer than target)
      if (frameTime > TARGET_FRAME_TIME * 1.5) {
        metricsRef.current.jankCount++;
      }

      // Calculate metrics
      if (metricsRef.current.frames.length === sampleSize && onMetricsUpdate) {
        const avgFrameTime = metricsRef.current.frames.reduce((a, b) => a + b, 0) / sampleSize;
        const fps = 1000 / avgFrameTime;
        const jank = metricsRef.current.jankCount / sampleSize;

        onMetricsUpdate({
          fps,
          frameTime: avgFrameTime,
          jank,
        });

        // Reset jank counter
        metricsRef.current.jankCount = 0;
      }

      metricsRef.current.lastFrameTime = now;
      animationFrame = requestAnimationFrame(measureFrame);
    }

    animationFrame = requestAnimationFrame(measureFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onMetricsUpdate, sampleSize]);
} 