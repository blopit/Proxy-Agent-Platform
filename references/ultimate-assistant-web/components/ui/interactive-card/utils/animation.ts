import type { CSSProperties } from "react";

type ShadowSize = "none" | "light" | "medium" | "heavy";

type GPUTransformStyle = {
  transform: string;
  transformStyle: "preserve-3d";
  willChange: "transform";
};

// Debounce function for smooth animations
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Calculate transform with GPU acceleration
export function getGPUTransform(
  tiltX: number,
  tiltY: number,
  perspective = 1000
): GPUTransformStyle {
  return {
    transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transformStyle: "preserve-3d",
    willChange: "transform",
  } as const;
}

type ThreeDStyle = {
  position: "relative";
  zIndex: number;
  boxShadow: string;
  transform: string;
  transformStyle: "preserve-3d";
  willChange: "transform";
};

// Generate optimized styles for 3D transforms
export function get3DStyles(
  zIndex: number,
  options: {
    shadow?: boolean | ShadowSize;
    shadowColor?: string;
    inset?: boolean;
  } = {}
): ThreeDStyle {
  const { shadow = "medium", shadowColor = "rgba(0,0,0,0.2)", inset = true } = options;

  const shadowSize = typeof shadow === "string" ? shadow : "medium";
  const shadowSizes: Record<ShadowSize, string> = {
    none: "0 0 0",
    light: "0 2px 4px",
    medium: "0 4px 8px",
    heavy: "0 8px 16px",
  };

  return {
    position: "relative",
    zIndex,
    boxShadow: shadow ? `${shadowSizes[shadowSize]} ${shadowColor}` : "none",
    transform: `translateZ(${inset ? -zIndex : zIndex}px)`,
    transformStyle: "preserve-3d",
    willChange: "transform",
  } as const;
}

// Calculate shadow intensity based on depth
export const getShadowStyle = (
  depth: number,
  intensity: 'light' | 'medium' | 'heavy',
  color: string = 'rgba(0,0,0,0.2)'
): string => {
  const intensityMap = {
    light: { offset: 2, blur: 4, spread: 1 },
    medium: { offset: 4, blur: 8, spread: 2 },
    heavy: { offset: 8, blur: 16, spread: 4 },
  };

  const { offset, blur, spread } = intensityMap[intensity];
  const depthFactor = Math.abs(depth) * 0.1;

  return `${offset * depthFactor}px ${blur * depthFactor}px ${spread * depthFactor}px ${color}`;
};

// Smooth animation curves
export const ANIMATION_CURVES = {
  swift: 'cubic-bezier(0.23, 1, 0.32, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

type TransitionStyle = {
  transition: string;
  willChange: "transform, opacity";
};

// Performance optimized transition strings
export function getTransitionStyle(duration = 300): TransitionStyle {
  return {
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    willChange: "transform, opacity",
  } as const;
} 