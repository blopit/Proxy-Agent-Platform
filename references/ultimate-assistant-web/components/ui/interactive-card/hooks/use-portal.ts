"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { triggerHapticFeedback } from "../utils/haptics";
import type { PortalActivationMode, PortalState } from "../portal-types";

const PORTAL_ACTIVATION_DELAY = 500;

interface UsePortalOptions {
  activationThreshold?: number;
  deactivationDelay?: number;
  hapticFeedback?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

/**
 * Hook to manage portal state and interactions with optimized performance
 */
export function usePortal({
  activationThreshold = 0.5,
  deactivationDelay = 300,
  hapticFeedback = true,
  onActivate,
  onDeactivate,
}: UsePortalOptions = {}) {
  // Use a ref to track if we should update state to reduce renders
  const shouldUpdateRef = useRef(true);
  const lastStateUpdateTime = useRef(0);
  
  // Initial state as memoized value
  const initialState = useMemo<PortalState>(() => ({
    isActive: false,
    isFullyActivated: false,
    isTransitioning: false,
    visibility: 0.25,
    activationProgress: 0,
    activationMode: "hover"
  }), []);
  
  const [portalState, setPortalState] = useState<PortalState>(initialState);

  const isMobile = useIsMobile();
  const activationTimer = useRef<NodeJS.Timeout>();
  const deactivationTimer = useRef<NodeJS.Timeout>();

  // Refs for tracking state
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activationStartTimeRef = useRef<number | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const stabilizationBufferRef = useRef<number[]>([]);
  const pointerIsDownRef = useRef(false);
  const pointerMoveCountRef = useRef(0);
  const lastPointerPositionRef = useRef({ x: 0, y: 0 });
  const touchVelocityRef = useRef({ x: 0, y: 0 });
  const lastTouchTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pendingStateUpdateRef = useRef<Partial<PortalState> | null>(null);
  
  // Constants for stabilization - memoized to ensure consistent reference
  const CONSTANTS = useMemo(() => ({
    BUFFER_SIZE: 5,
    MOVE_THRESHOLD: 2,
    MIN_ACTIVATION_DURATION: 120,
    ACTIVATION_HYSTERESIS: 0.12,
    VELOCITY_THRESHOLD: 0.08,
    TOUCH_DEBOUNCE: 33,
    // Minimum time between state updates (ms)
    MIN_STATE_UPDATE_INTERVAL: 16,
  }), []);
  
  // Performance optimization: Batch state updates using requestAnimationFrame
  const scheduleStateUpdate = useCallback((stateChanges: Partial<PortalState>) => {
    const now = performance.now();
    const timeSinceLastUpdate = now - lastStateUpdateTime.current;
    
    // Queue update or merge with existing update
    if (pendingStateUpdateRef.current) {
      pendingStateUpdateRef.current = {
        ...pendingStateUpdateRef.current,
        ...stateChanges
      };
      return;
    }
    
    pendingStateUpdateRef.current = stateChanges;
    
    // If we had a recent update, use rAF to batch changes
    if (timeSinceLastUpdate < CONSTANTS.MIN_STATE_UPDATE_INTERVAL) {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingStateUpdateRef.current) {
            setPortalState(prev => ({
              ...prev,
              ...pendingStateUpdateRef.current
            }));
            pendingStateUpdateRef.current = null;
            lastStateUpdateTime.current = performance.now();
          }
          rafRef.current = null;
        });
      }
    } else {
      // If enough time has passed, update immediately
      setPortalState(prev => ({
        ...prev,
        ...stateChanges
      }));
      pendingStateUpdateRef.current = null;
      lastStateUpdateTime.current = now;
    }
  }, [CONSTANTS.MIN_STATE_UPDATE_INTERVAL]);
  
  // Calculate stable activation progress from buffer with weighted average
  const getStableProgress = useCallback(() => {
    if (stabilizationBufferRef.current.length === 0) return 0;
    
    // Fast path for single value
    if (stabilizationBufferRef.current.length === 1) {
      return stabilizationBufferRef.current[0];
    }
    
    // Sort values for median calculation
    const sorted = [...stabilizationBufferRef.current].sort((a, b) => a - b);
    
    // Get median
    const midIndex = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[midIndex - 1] + sorted[midIndex]) / 2
      : sorted[midIndex];
    
    // Get recency-weighted average (recent values have higher weight)
    // Optimized calculation for small arrays
    const values = stabilizationBufferRef.current;
    const len = values.length;
    const lastIndex = len - 1;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Process in reverse for slightly better cache performance
    for (let i = lastIndex; i >= 0; i--) {
      const weight = (i + 1) / len;
      weightedSum += values[i] * weight;
      totalWeight += weight;
    }
    
    const weightedAvg = weightedSum / totalWeight;
    
    // Bias towards median for stability, with weighted average for responsiveness
    return 0.7 * median + 0.3 * weightedAvg;
  }, []);
  
  // Add value to stabilization buffer - optimized with early exit
  const addToBuffer = useCallback((value: number) => {
    const existingValues = stabilizationBufferRef.current;
    const { BUFFER_SIZE } = CONSTANTS;
    
    // If buffer has values and new value is very close to the most recent one, skip
    if (existingValues.length > 0) {
      const mostRecent = existingValues[existingValues.length - 1];
      // Only add if difference is significant
      if (Math.abs(value - mostRecent) < 0.03) {
        return;
      }
    }
    
    // Fast add/remove for short arrays
    if (existingValues.length >= BUFFER_SIZE) {
      existingValues.shift();
    }
    existingValues.push(value);
  }, [CONSTANTS]);

  // Cleanup all timers and animations
  const clearTimers = useCallback(() => {
    if (activationTimer.current) {
      clearTimeout(activationTimer.current);
      activationTimer.current = undefined;
    }
    if (deactivationTimer.current) {
      clearTimeout(deactivationTimer.current);
      deactivationTimer.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const activatePortal = useCallback(() => {
    if (portalState.isActive && portalState.isFullyActivated) return;
    
    // First move to transitioning state
    scheduleStateUpdate({ 
      isActive: true,
      isTransitioning: true,
      visibility: 0.6,
      activationProgress: 0.8
    });

    // Provide haptic feedback on mobile
    if (hapticFeedback && isMobile) {
      triggerHapticFeedback("light");
    }

    // Set activation start time
    activationStartTimeRef.current = performance.now();
    
    // Call onActivate callback if provided
    onActivate?.();

    // Clear any existing activation timer
    if (activationTimer.current) {
      clearTimeout(activationTimer.current);
    }

    // Complete the activation after a delay
    activationTimer.current = setTimeout(() => {
      scheduleStateUpdate({ 
        isFullyActivated: true,
        isTransitioning: false,
        visibility: 1,
        activationProgress: 1
      });
    }, 400); // Slightly faster activation for better perceived performance
  }, [hapticFeedback, isMobile, onActivate, portalState.isActive, portalState.isFullyActivated, scheduleStateUpdate]);

  const deactivatePortal = useCallback(() => {
    if (!portalState.isActive) return;
    
    // First move to transitioning state
    scheduleStateUpdate({ 
      isFullyActivated: false,
      isTransitioning: true,
      visibility: 0.4,
      activationProgress: 0.6
    });
    
    // Clear any existing timeouts
    clearTimers();
    
    // Begin deactivation after delay
    timeoutRef.current = setTimeout(() => {
      scheduleStateUpdate({ 
        isActive: false,
        isTransitioning: false,
        visibility: 0.25,
        activationProgress: 0
      });
      stabilizationBufferRef.current = [];
      activationStartTimeRef.current = null;
      onDeactivate?.();
    }, deactivationDelay);
  }, [clearTimers, deactivationDelay, onDeactivate, portalState.isActive, scheduleStateUpdate]);

  // Event handlers optimized with early returns
  const handleMouseEnter = useCallback(() => {
    if (portalState.activationMode !== "hover" || isMobile) return;
    clearTimers();
    activationTimer.current = setTimeout(activatePortal, PORTAL_ACTIVATION_DELAY);
  }, [portalState.activationMode, isMobile, clearTimers, activatePortal]);

  const handleMouseLeave = useCallback(() => {
    if (portalState.activationMode !== "hover" || isMobile) return;
    deactivatePortal();
  }, [portalState.activationMode, isMobile, deactivatePortal]);

  const handleTouchStart = useCallback(() => {
    if (portalState.activationMode !== "touch" || !isMobile) return;
    clearTimers();
    activationTimer.current = setTimeout(activatePortal, PORTAL_ACTIVATION_DELAY);
  }, [portalState.activationMode, isMobile, clearTimers, activatePortal]);

  const handleTouchEnd = useCallback(() => {
    if (portalState.activationMode !== "touch" || !isMobile) return;
    deactivatePortal();
  }, [portalState.activationMode, isMobile, deactivatePortal]);

  const handleClick = useCallback(() => {
    if (portalState.activationMode !== "click") return;
    if (portalState.isActive) {
      deactivatePortal();
    } else {
      activatePortal();
    }
  }, [portalState.activationMode, portalState.isActive, activatePortal, deactivatePortal]);

  // Optimized updateProgress function that minimizes state updates
  const updateProgress = useCallback(
    (progress: number) => {
      // Skip updates when progress hasn't changed enough
      if (progress === lastProgressUpdateRef.current) return;
      
      // Debounce touch updates to reduce jitter
      const now = performance.now();
      
      if (isMobile && (now - lastTouchTimeRef.current < CONSTANTS.TOUCH_DEBOUNCE)) {
        return;
      }
      lastTouchTimeRef.current = now;
      
      // Ignore small fluctuations to reduce jitter
      const progressDiff = Math.abs(progress - lastProgressUpdateRef.current);
      if (progressDiff < 0.03 && progress !== 0 && progress !== 1) return;
      
      // If touch velocity is too high, ignore this update (prevents erratic behavior)
      const velocity = Math.hypot(
        touchVelocityRef.current.x, 
        touchVelocityRef.current.y
      );
      
      if (velocity > CONSTANTS.VELOCITY_THRESHOLD && progress > 0) {
        return;
      }
      
      // Update last progress value
      lastProgressUpdateRef.current = progress;
      
      // Add to stabilization buffer
      addToBuffer(progress);
      
      // Get stabilized progress
      const stableProgress = getStableProgress();
      
      // Apply easing to make activation more predictable (optimized calculation)
      const easedProgress = Math.min(1, stableProgress ** 0.8);
      
      // Only update state if activation progress changed significantly
      if (Math.abs(easedProgress - portalState.activationProgress) > 0.02) {
        scheduleStateUpdate({ activationProgress: easedProgress });
      }
      
      // Determine if peek should be active with hysteresis
      const shouldBeActive = easedProgress >= activationThreshold;
      const shouldBeInactive = easedProgress < (activationThreshold - CONSTANTS.ACTIVATION_HYSTERESIS);
      
      // Only update if state actually needs to change to reduce renders
      if (portalState.isActive && shouldBeInactive) {
        scheduleStateUpdate({
          isActive: false,
          isFullyActivated: false,
          visibility: 0.25
        });
      } else if (!portalState.isActive && shouldBeActive) {
        scheduleStateUpdate({
          isActive: true,
          isTransitioning: true,
          visibility: Math.min(1, 0.4 + easedProgress * 0.6)
        });
      } else if (portalState.isActive && !portalState.isFullyActivated) {
        // Smooth updates to visibility while active but not fully activated
        // Only update if visibility changes enough to be noticeable
        const newVisibility = Math.min(1, 0.4 + easedProgress * 0.6);
        if (Math.abs(newVisibility - portalState.visibility) > 0.03) {
          scheduleStateUpdate({ visibility: newVisibility });
        }
      }
      
      // Handle full activation with minimum duration check
      if (
        activationStartTimeRef.current && 
        easedProgress >= 0.98 && 
        !portalState.isFullyActivated
      ) {
        const activationDuration = performance.now() - activationStartTimeRef.current;
        if (activationDuration >= CONSTANTS.MIN_ACTIVATION_DURATION) {
          activatePortal();
        }
      }
    },
    [
      isMobile,
      activatePortal, 
      activationThreshold, 
      addToBuffer, 
      getStableProgress, 
      portalState.isActive,
      portalState.isFullyActivated,
      portalState.visibility,
      portalState.activationProgress,
      scheduleStateUpdate,
      CONSTANTS,
    ]
  );

  // Optimized pointer event handlers
  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    pointerIsDownRef.current = true;
    pointerMoveCountRef.current = 0;
    activationStartTimeRef.current = performance.now();
    lastPointerPositionRef.current = { 
      x: event.clientX, 
      y: event.clientY 
    };
    touchVelocityRef.current = { x: 0, y: 0 };
    lastTouchTimeRef.current = performance.now();
    
    // Reset buffer on new interaction
    stabilizationBufferRef.current = [];
  }, []);

  const handlePointerUp = useCallback(() => {
    pointerIsDownRef.current = false;
    
    // Reset velocity tracking
    touchVelocityRef.current = { x: 0, y: 0 };
    
    // If progress was high enough, keep peek active for a moment before fading
    if (portalState.activationProgress > 0.3 && !portalState.isFullyActivated) {
      // Short timeout for a nicer fade out
      const delay = Math.min(150, portalState.activationProgress * 300);
      setTimeout(() => {
        if (!pointerIsDownRef.current) {
          updateProgress(0);
        }
      }, delay);
    } else {
      updateProgress(0);
    }
  }, [portalState.activationProgress, portalState.isFullyActivated, updateProgress]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Skip processing if pointer is not down
      if (!pointerIsDownRef.current) return;
      
      // Only process after a few move events to filter out initial jitter
      if (++pointerMoveCountRef.current < CONSTANTS.MOVE_THRESHOLD) return;
      
      const now = performance.now();
      const timeDelta = now - lastTouchTimeRef.current;
      
      // Calculate velocity in pixels per millisecond
      if (timeDelta > 0) {
        const dx = event.clientX - lastPointerPositionRef.current.x;
        const dy = event.clientY - lastPointerPositionRef.current.y;
        
        touchVelocityRef.current = {
          x: dx / timeDelta,
          y: dy / timeDelta
        };
      }
      
      // Update last position
      lastPointerPositionRef.current = { 
        x: event.clientX, 
        y: event.clientY 
      };
      lastTouchTimeRef.current = now;
      
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const { width, height } = rect;
      
      // Calculate center point
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Calculate distance from center (normalized)
      // Use client coordinates relative to element for more accurate calculation
      const elementX = event.clientX - rect.left;
      const elementY = event.clientY - rect.top;
      const deltaX = (elementX - centerX) / centerX;
      const deltaY = (elementY - centerY) / centerY;
      
      // Distance from center using square magnitude for performance
      // (avoid square root when possible)
      const distanceSq = deltaX * deltaX + deltaY * deltaY;
      
      // Use improved easing curve for smoother activation
      // If distance is very small, short-circuit to 0
      if (distanceSq < 0.01) {
        updateProgress(0);
        return;
      }
      
      // Only calculate square root when necessary
      const distance = Math.sqrt(distanceSq);
      
      // This reduces sensitivity in the center and increases it toward edges
      const normalizedDistance = Math.min(1, distance / 0.8);
      
      // Cubic easing curve that starts slower and accelerates (optimized)
      // Use direct power operation which is faster than Math.pow
      const smoothProgress = normalizedDistance * normalizedDistance * Math.sqrt(normalizedDistance);
      
      // Apply the update with built-in debouncing
      updateProgress(smoothProgress);
    },
    [updateProgress, CONSTANTS]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      
      // Clear any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [clearTimers]);

  // Return memoized handlers object to prevent unnecessary re-renders
  const handlers = useMemo(() => ({
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onClick: handleClick,
  }), [
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
    handleClick
  ]);

  return {
    portalState,
    activatePortal,
    deactivatePortal,
    handlers,
    updateProgress,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
  };
} 