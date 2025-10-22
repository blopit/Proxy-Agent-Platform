import type { ReactNode, HTMLAttributes, CSSProperties } from "react";
import type { Z_LAYERS } from "./constants";

export type ColorValue = [number, number, number];

export type GradientColor = {
  start: ColorValue;
  end: ColorValue;
};

export type ColorMap = {
  [key: string]: ColorValue | GradientColor;
};

export interface LayerProps {
  children: ReactNode;
  zIndex?: number;
  className?: string;
  shadow?: boolean | "light" | "medium" | "heavy";
  shadowColor?: string;
  preset?: keyof typeof Z_LAYERS;
  inset?: boolean;
  depth?: number;
  peekContent?: ReactNode;
}

export interface SurfaceContentProps {
  children: ReactNode;
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
  offset?: number;
}

export interface PeekContentProps {
  children: ReactNode;
  side?: 'right' | 'left' | 'top' | 'bottom';
  threshold?: number;
  offset?: number;
  tiltX?: number;
  tiltY?: number;
  style?: CSSProperties;
  isActive?: boolean;
  onVisibilityChange?: (visibility: number) => void;
}

export interface LayersProps extends Omit<LayerProps, 'children'> {
  children: ReactNode;
  start?: number;
  end?: number;
  reverse?: boolean;
  keyPrefix?: string;
  depthMultiplier?: number;
  varyDepth?: boolean;
}

export interface InteractiveCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  expandedContent?: ReactNode;
  color?: string;
  isTrending?: boolean;
  borderColorMap?: Record<string, string>;
  dropShadowIntensity?: "light" | "medium" | "heavy";
  hoverScale?: number;
  hoverTilt?: boolean;
  compact?: boolean;
  enhanced3D?: boolean;
  maxDragDistance?: number;
  perspective?: number;
  layerMovement?: number;
  insetMode?: boolean;
  portalMask?: boolean;
  portalDepth?: number;
  peekContent?: ReactNode;
  peekThreshold?: number;
  maxPeekOffset?: number;
}

export interface LayerContextType {
  registerLayer: (id: string, zIndex: number, options?: { shadow?: boolean | string, shadowColor?: string, inset?: boolean }) => void;
  unregisterLayer: (id: string) => void;
  getLayerStyle: (zIndex: number, options?: { shadow?: boolean | string, shadowColor?: string, inset?: boolean }) => CSSProperties;
  distributeZ: (count: number, startZ?: number, endZ?: number) => number[];
}

export type PortalActivationMode = 'tilt' | 'hover' | 'press' | 'auto';

export interface PortalFeedback {
  haptic?: boolean;
  visual?: boolean;
  sound?: boolean;
}

export interface PortalAction {
  type: 'navigate' | 'expand' | 'minimize' | 'custom';
  direction?: 'next' | 'previous' | 'up' | 'down';
  payload?: any;
  onComplete?: () => void;
}

export interface PortalContentProps {
  children: ReactNode;
  side?: 'right' | 'left' | 'top' | 'bottom';
  threshold?: number;
  offset?: number;
  tiltX?: number;
  tiltY?: number;
  style?: CSSProperties;
  isActive?: boolean;
  onVisibilityChange?: (visibility: number) => void;
  activationMode?: PortalActivationMode;
  holdDuration?: number; // Duration in ms for press mode
  feedback?: PortalFeedback;
  action?: PortalAction;
  indicator?: ReactNode; // Visual indicator for available portal
  progressIndicator?: boolean; // Show activation progress
  label?: string; // Accessibility label
}

export interface PortalState {
  isActive: boolean;
  visibility: number;
  activationProgress: number;
  isFullyActivated: boolean;
  activationMode: PortalActivationMode;
} 