import type { HTMLAttributes, ReactNode, CSSProperties } from 'react';

/**
 * Defines the different modes of portal activation
 */
export type PortalActivationMode = "hover" | "touch" | "click";

/**
 * Possible portal actions that can be triggered
 */
export type PortalAction = 'dialog' | 'message';

/**
 * Feedback options for portal activation
 */
export type PortalFeedback = {
  haptic?: boolean;
  visual?: boolean;
};

/**
 * Actions that can be triggered upon portal completion
 */
export type PortalActionConfig = {
  onComplete?: () => void;
};

/**
 * State of the portal
 */
export interface PortalState {
  /** Whether the portal is currently active */
  isActive: boolean;
  /** Whether the portal is currently fully activated */
  isFullyActivated: boolean;
  /** Whether the portal is currently transitioning */
  isTransitioning: boolean;
  /** Visibility level of the portal (0-1) */
  visibility: number;
  /** Progress of activation (0-1) */
  activationProgress: number;
  /** Mode of activation */
  activationMode: PortalActivationMode;
}

/**
 * Result of portal completion
 */
export interface PortalCompletionResult {
  /** Action to perform when portal completes */
  action: PortalAction;
  /** Optional message to display */
  message?: string;
}

/**
 * Props for the PortalContent component
 */
export interface PortalContentProps {
  /** Child elements to display in the portal */
  children: ReactNode;
  /** Portal state object */
  portalState: PortalState;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Callback when portal is fully activated */
  onPortalComplete?: (result: PortalCompletionResult) => void;
}

/**
 * Layer configuration options
 */
export type LayerOptions = {
  /** Shadow intensity or boolean */
  shadow?: boolean | "light" | "medium" | "heavy";
  /** Shadow color */
  shadowColor?: string;
  /** Whether to use inset mode */
  inset?: boolean;
};

/**
 * Base props for the interactive card component
 */
export interface InteractiveCardBaseProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Color theme */
  color?: string;
  /** Whether the card is trending */
  isTrending?: boolean;
  /** Border color map by color name */
  borderColorMap?: Record<string, string>;
  /** Shadow intensity */
  dropShadowIntensity?: "light" | "medium" | "heavy";
  /** Hover scale factor */
  hoverScale?: number;
  /** Enable hover tilt effect */
  hoverTilt?: boolean;
  /** Use compact layout */
  compact?: boolean;
  /** Enable enhanced 3D effects */
  enhanced3D?: boolean;
  /** Maximum drag distance */
  maxDragDistance?: number;
  /** Perspective value for 3D effects */
  perspective?: number;
  /** Layer movement amount */
  layerMovement?: number;
  /** Whether to use inset mode */
  insetMode?: boolean;
}

/**
 * Portal-related props for the interactive card
 */
export type InteractiveCardPortalProps = {
  /** Portal activation mode */
  activationMode?: PortalActivationMode;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Content to show in the portal */
  portalContent?: ReactNode;
  /** Duration to hold for activation in ms */
  portalHoldDuration?: number;
  /** Activation threshold */
  portalThreshold?: number;
  /** Portal offset */
  portalOffset?: number;
  /** Portal feedback options */
  portalFeedback?: PortalFeedback;
  /** Portal action to trigger */
  portalAction?: PortalActionConfig;
  /** Visual indicator for available portal */
  portalIndicator?: ReactNode;
  /** Whether to show activation progress */
  portalProgressIndicator?: boolean;
  /** Portal accessibility label */
  portalLabel?: string;
  /** Callback when portal action completes */
  onPortalComplete?: (result: PortalCompletionResult) => void;
  /** Whether the portal is currently active */
  isActive?: boolean;
}; 