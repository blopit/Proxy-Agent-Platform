import { useCallback, useEffect, useRef, useState } from 'react';
import { spring, smoothDamp, createBezier } from '../utils/interpolation';
import { getGPUTransform } from '../utils/animation';
import { usePerformance } from './use-performance';
import type { InteractiveCardProps } from '../types';

interface TiltState {
  tiltX: number;
  tiltY: number;
  scale: number;
}

interface TiltOptions {
  hoverTilt?: boolean;
  hoverScale?: number;
  perspective?: number;
  layerMovement?: number;
  mass?: number;
  stiffness?: number;
  damping?: number;
  smoothTime?: number;
}

interface TiltVelocity {
  x: number;
  y: number;
  scale: number;
}

const NATURAL_EASING = createBezier(0.16, 1, 0.3, 1);
const PERFORMANCE_THRESHOLD = 45; // fps

export function useTilt({
  hoverTilt = true,
  hoverScale = 1.05,
  perspective = 1000,
  layerMovement = 1,
  mass = 1,
  stiffness = 170,
  damping = 26,
  smoothTime = 0.15,
}: TiltOptions = {}) {
  const [tiltState, setTiltState] = useState<TiltState>({
    tiltX: 0,
    tiltY: 0,
    scale: 1,
  });

  const velocityRef = useRef<TiltVelocity>({ x: 0, y: 0, scale: 0 });
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const targetRef = useRef<TiltState>({ tiltX: 0, tiltY: 0, scale: 1 });
  const isReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Monitor performance and adjust animation quality
  const [isHighPerformance, setIsHighPerformance] = useState(true);
  usePerformance((metrics) => {
    setIsHighPerformance(metrics.fps >= PERFORMANCE_THRESHOLD);
  });

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Animation loop with smooth interpolation
  const animate = useCallback(() => {
    if (!hoverTilt || isReducedMotion.current) {
      setTiltState(targetRef.current);
      return;
    }

    const now = performance.now();
    const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1); // Cap at 100ms
    lastTimeRef.current = now;

    if (isHighPerformance) {
      // Use spring physics for high performance
      const [newTiltX, velocityX] = spring(
        tiltState.tiltX,
        targetRef.current.tiltX,
        velocityRef.current.x,
        mass,
        stiffness,
        damping
      );

      const [newTiltY, velocityY] = spring(
        tiltState.tiltY,
        targetRef.current.tiltY,
        velocityRef.current.y,
        mass,
        stiffness,
        damping
      );

      const [newScale, velocityScale] = spring(
        tiltState.scale,
        targetRef.current.scale,
        velocityRef.current.scale,
        mass,
        stiffness * 2, // Stiffer scale animation
        damping
      );

      velocityRef.current = { x: velocityX, y: velocityY, scale: velocityScale };
      
      setTiltState({
        tiltX: newTiltX,
        tiltY: newTiltY,
        scale: newScale,
      });
    } else {
      // Use simpler smoothDamp for lower performance
      const [newPos, newVel] = smoothDamp(
        { x: tiltState.tiltX, y: tiltState.tiltY },
        { x: targetRef.current.tiltX, y: targetRef.current.tiltY },
        { x: velocityRef.current.x, y: velocityRef.current.y },
        smoothTime,
        deltaTime
      );

      velocityRef.current = { ...newVel, scale: 0 };
      
      setTiltState({
        tiltX: newPos.x,
        tiltY: newPos.y,
        scale: NATURAL_EASING(
          Math.min(1, Math.abs(newPos.x) / 20 + Math.abs(newPos.y) / 20)
        ) * (hoverScale - 1) + 1,
      });
    }

    frameRef.current = requestAnimationFrame(animate);
  }, [hoverTilt, isHighPerformance, mass, stiffness, damping, smoothTime, hoverScale, tiltState]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverTilt) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    targetRef.current = {
      tiltX: y * -10 * layerMovement, // Inverted for natural feel
      tiltY: x * 10 * layerMovement,
      scale: hoverScale,
    };

    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [hoverTilt, layerMovement, hoverScale, animate]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    targetRef.current = {
      tiltX: 0,
      tiltY: 0,
      scale: 1,
    };

    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  // Reset tilt state
  const resetTilt = useCallback(() => {
    targetRef.current = {
      tiltX: 0,
      tiltY: 0,
      scale: 1,
    };
    velocityRef.current = { x: 0, y: 0, scale: 0 };
    setTiltState(targetRef.current);
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
  }, []);

  // Generate optimized transform style
  const tiltStyle = {
    transform: getGPUTransform(
      0,
      0,
      0,
      tiltState.scale,
      tiltState.tiltX,
      tiltState.tiltY
    ),
    transformOrigin: 'center',
  };

  return {
    tiltStyle,
    tiltState,
    handleMouseMove,
    handleMouseLeave,
    resetTilt,
  };
} 