"use client";

import React, { memo, useRef, useMemo, useEffect, useLayoutEffect } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { PortalContentProps, PortalState } from "./portal-types";

const portalVariants = cva("peek-content will-change-transform", {
  variants: {
    mobile: {
      true: "peek-content-mobile",
      false: "",
    },
  },
  defaultVariants: {
    mobile: false,
  },
});

/**
 * Component for portal content that appears during peek interactions
 */
function PortalContentComponent({
  children,
  portalState,
  className,
  style,
  onPortalComplete,
  ...props
}: PortalContentProps) {
  const { activationProgress, isFullyActivated, isTransitioning, visibility } = portalState;
  const blurValueRef = useRef(0);
  const lastVisibilityValueRef = useRef(0.25);
  const animationFrameRef = useRef<number | null>(null);
  const transitionCompleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStateRef = useRef(portalState);

  // Use layout effect for smoother visual transitions
  useLayoutEffect(() => {
    prevStateRef.current = portalState;
  }, [portalState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (transitionCompleteTimerRef.current) {
        clearTimeout(transitionCompleteTimerRef.current);
      }
    };
  }, []);

  // Determine whether to trigger onPortalComplete callback
  useEffect(() => {
    if (isFullyActivated && !transitionCompleteTimerRef.current) {
      transitionCompleteTimerRef.current = setTimeout(() => {
        if (onPortalComplete) {
          onPortalComplete({ action: "dialog" });
        }
        transitionCompleteTimerRef.current = null;
      }, 350); // Reduced from 500ms for faster response
    }

    return () => {
      if (transitionCompleteTimerRef.current) {
        clearTimeout(transitionCompleteTimerRef.current);
        transitionCompleteTimerRef.current = null;
      }
    };
  }, [isFullyActivated, onPortalComplete]);

  // Calculate dynamic styles with optimized performance
  const dynamicStyles = useMemo(() => {
    // Early return if no visible change needed
    if (activationProgress < 0.01 && !isFullyActivated && !isTransitioning && visibility <= 0.25) {
      return {
        transform: 'translateY(0) scale(0.98)',
        opacity: 0.25,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        willChange: 'auto',
        backfaceVisibility: 'hidden' as const
      };
    }
    
    // Calculate blur value with improved stability
    // Use quadratic curve for blur for more efficient calculation
    const targetBlur = activationProgress < 0.1
      ? 2
      : Math.max(2, Math.min(8, 8 - (activationProgress * 6)));
    
    // Apply hysteresis to blur value updates for a smoother visual effect
    const blurDiff = Math.abs(targetBlur - blurValueRef.current);
    
    // Only update blur if the change is significant (optimization)
    if (blurDiff > 0.5 || targetBlur <= 2 || targetBlur >= 7.5) {
      blurValueRef.current = targetBlur;
    }
    
    // Calculate opacity with a custom curve (starts higher, smoother transition)
    // Optimized calculation with fewer operations
    const targetOpacity = Math.max(
      0.25,
      Math.min(1, visibility * 1.2)
    );
    
    // Apply hysteresis to opacity for smoother transitions
    const opacityDiff = Math.abs(targetOpacity - lastVisibilityValueRef.current);
    const newOpacity = opacityDiff > 0.02
      ? targetOpacity
      : lastVisibilityValueRef.current;
    
    lastVisibilityValueRef.current = newOpacity;
    
    // Calculate scale with a subtle zoom effect (simplified calculation)
    const scale = isFullyActivated
      ? 1
      : 0.98 + (activationProgress * 0.02);
    
    return {
      // Hardware-accelerated transforms for smooth animations
      transform: `translate3d(0, 0, 0) scale(${scale})`,
      opacity: newOpacity,
      backdropFilter: `blur(${blurValueRef.current}px)`,
      WebkitBackdropFilter: `blur(${blurValueRef.current}px)`,
      // Preload blur effect for smoother initial blur
      willChange: isTransitioning ? "transform, opacity, backdrop-filter" : "auto",
      // Ensure hardware acceleration with translate3d
      backfaceVisibility: "hidden" as const
    };
  }, [activationProgress, isFullyActivated, isTransitioning, visibility]);
  
  // Apply smooth animations with adaptive timing for natural feel
  const transitions = useMemo(() => {
    if (!isTransitioning && !isFullyActivated && activationProgress < 0.01) {
      // Skip transition calculation when not needed
      return "";
    }
    
    const baseTransition = "transform 350ms cubic-bezier(0.4, 0.0, 0.2, 1)";
    const blurTransition = "backdrop-filter 350ms cubic-bezier(0.4, 0.0, 0.2, 1)";
    const opacityTransition = isTransitioning
      ? "opacity 250ms cubic-bezier(0.4, 0.0, 0.2, 1)"
      : "opacity 350ms cubic-bezier(0.4, 0.0, 0.2, 1)";
    
    return `${baseTransition}, ${opacityTransition}, ${blurTransition}`;
  }, [isTransitioning, isFullyActivated, activationProgress]);

  // Active/inactive state class
  const stateClass = useMemo(() => {
    if (isFullyActivated) return "active";
    if (isTransitioning) return "transitioning";
    return "";
  }, [isFullyActivated, isTransitioning]);

  return (
    <div
      className={cn(portalVariants({ className }), stateClass)}
      style={{
        ...style,
        ...dynamicStyles,
        transition: transitions,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export const PortalContent = memo(PortalContentComponent); 
