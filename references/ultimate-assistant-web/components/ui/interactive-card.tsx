"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Stars, Search, ArrowUp } from "lucide-react";

// Z-index presets for common content elements - negative values for inset effect
export const Z_LAYERS = {
  BASE: 0,          // Card base
  FLOAT: 70,        // Closest floating elements (least deep)
  HIGHLIGHT: -20,    // Highlighted elements
  PRIMARY: -30,      // Primary content, main text  
  SECONDARY: -50,    // Secondary content
  BACKGROUND: -70    // Deepest background elements
};

// Layer context for managing z-index and depth
const LayerContext = React.createContext<{
  registerLayer: (id: string, zIndex: number, options?: { shadow?: boolean | string, shadowColor?: string, inset?: boolean }) => void;
  unregisterLayer: (id: string) => void;
  getLayerStyle: (zIndex: number, options?: { shadow?: boolean | string, shadowColor?: string, inset?: boolean }) => React.CSSProperties;
  distributeZ: (count: number, startZ?: number, endZ?: number) => number[];
}>({
  registerLayer: () => {},
  unregisterLayer: () => {},
  getLayerStyle: () => ({}),
  distributeZ: () => [],
});

// Layer component with inset mode
interface LayerProps {
  children: React.ReactNode;
  zIndex?: number; // z-height in pixels (negative for inset)
  className?: string;
  shadow?: boolean | "light" | "medium" | "heavy"; 
  shadowColor?: string;
  preset?: keyof typeof Z_LAYERS;
  inset?: boolean; // Whether to render the layer with inset effect (default true)
  depth?: number; // Custom depth multiplier (1.0 is normal, higher values = deeper)
}

export function Layer({ 
  children, 
  zIndex, 
  className, 
  shadow = "medium", 
  shadowColor = "rgba(0,0,0,0.2)",
  preset,
  inset = true,
  depth = 1.0,
  peekContent,
}: LayerProps & { peekContent?: React.ReactNode }) {
  const id = React.useId();
  const layerRef = React.useRef<HTMLDivElement>(null);
  const { registerLayer, unregisterLayer, getLayerStyle } = React.useContext(LayerContext);
  const isMobile = useIsMobile();
  const [touchCount, setTouchCount] = React.useState(0);
  const [isTilting, setIsTilting] = React.useState(false);
  
  const [peekStyle, setPeekStyle] = React.useState({
    opacity: 0,
    transform: 'translate3d(0, 0, 0)'
  });
  
  // Handle tilt effect for peek content
  const handleTilt = React.useCallback((tiltX: number, tiltY: number) => {
    if (!peekContent || !layerRef.current) return;
    
    const peekElements = layerRef.current.querySelectorAll('.peek-content');
    for (const elem of peekElements) {
      const side = elem.getAttribute('data-peek-side');
      const threshold = Number(elem.getAttribute('data-peek-threshold') || 5);
      const maxOffset = Number(elem.getAttribute('data-peek-offset') || 40);
      
      const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY);
      
      // Determine which direction the card is being tilted
      const isTiltingRight = tiltX > threshold;
      const isTiltingLeft = tiltX < -threshold;
      const isTiltingUp = tiltY < -threshold;
      const isTiltingDown = tiltY > threshold;
      
      // Only apply transform for the side being tilted away from
      // No opacity changes since we're always showing the portal walls
      let shouldAnimate = false;
      let peekProgress = 0;
      
      if (side === 'right' && isTiltingLeft) {
        peekProgress = Math.min(1, Math.abs(tiltX) / 20);
        shouldAnimate = true;
      } else if (side === 'left' && isTiltingRight) {
        peekProgress = Math.min(1, Math.abs(tiltX) / 20);
        shouldAnimate = true;
      } else if (side === 'top' && isTiltingDown) {
        peekProgress = Math.min(1, Math.abs(tiltY) / 20);
        shouldAnimate = true;
      } else if (side === 'bottom' && isTiltingUp) {
        peekProgress = Math.min(1, Math.abs(tiltY) / 20);
        shouldAnimate = true;
      }
      
      // Apply transform for "peeking" effect - no opacity changes
      const moveDir = 1 - peekProgress;
      if (shouldAnimate) {
        switch(side) {
          case 'right':
            (elem as HTMLElement).style.transform = `translate3d(${moveDir * 10}px, 0, ${-moveDir * 20}px)`;
            break;
          case 'left':
            (elem as HTMLElement).style.transform = `translate3d(${-moveDir * 10}px, 0, ${-moveDir * 20}px)`;
            break;
          case 'top':
            (elem as HTMLElement).style.transform = `translate3d(0, ${-moveDir * 10}px, ${-moveDir * 20}px)`;
            break;
          case 'bottom':
            (elem as HTMLElement).style.transform = `translate3d(0, ${moveDir * 10}px, ${-moveDir * 20}px)`;
            break;
        }
      } else {
        // Default position
        (elem as HTMLElement).style.transform = 'translate3d(0, 0, -30px)';
      }

      // Apply a 3D rotation for more dimension if animating
      if (shouldAnimate) {
        const rotX = side === 'top' ? '45deg' : side === 'bottom' ? '-45deg' : '0';
        const rotY = side === 'left' ? '45deg' : side === 'right' ? '-45deg' : '0';
        (elem as HTMLElement).style.transform += ` rotateX(${rotX}) rotateY(${rotY})`;
      }
      
      console.log(`Portal wall ${side}: progress=${peekProgress}, animating=${shouldAnimate}`);
    }
  }, [peekContent]);
  
  // Handle touch events
  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    // Only handle single-touch interactions for tilt effect
    if (e.touches.length === 1) {
      setTouchCount(1);
      setIsTilting(true);
    } else {
      // If more than one touch, disable tilt effect
      setTouchCount(e.touches.length);
      setIsTilting(false);
      // Reset any existing tilt
      if (layerRef.current) {
        layerRef.current.style.transform = 'none';
      }
      handleTilt(0, 0);
    }
  }, [handleTilt]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    // Only handle touch move if we're in single-touch mode and tilting is enabled
    if (touchCount !== 1 || !isTilting || !layerRef.current) return;

    const touch = e.touches[0];
    const rect = layerRef.current.getBoundingClientRect();
    
    const x = (touch.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (touch.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    
    handleTilt(x * 20, y * 20);
  }, [touchCount, isTilting, handleTilt]);

  const handleTouchEnd = React.useCallback(() => {
    setTouchCount(0);
    setIsTilting(false);
    if (layerRef.current) {
      layerRef.current.style.transform = 'none';
    }
    handleTilt(0, 0);
  }, [handleTilt]);
  
  // Determine the actual z-index to use (preset takes priority if provided)
  const actualZIndex = preset ? Z_LAYERS[preset] : (zIndex ?? Z_LAYERS.PRIMARY);
  
  // Apply depth multiplier to create varied distances
  const adjustedZIndex = actualZIndex * depth;
  
  // On mobile, we need to enhance the z-index separation to make layers more distinct
  const mobileAdjustedZIndex = isMobile ? adjustedZIndex * 1.5 : adjustedZIndex;
  
  React.useEffect(() => {
    const element = layerRef.current;
    if (!element) return;

    registerLayer(id, mobileAdjustedZIndex, { shadow, shadowColor, inset });

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      unregisterLayer(id);
      // Clean up touch event listeners
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [
    id, 
    mobileAdjustedZIndex, 
    registerLayer, 
    unregisterLayer, 
    shadow, 
    shadowColor, 
    inset,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  ]);
  
  return (
    <div 
      ref={layerRef}
      className={cn(
        "relative w-full overflow-hidden",
        "transform-style-preserve-3d will-change-transform",
        inset && "layer-inset",
        isMobile && "mobile-3d-layer",
        className
      )}
      style={{
        ...getLayerStyle(actualZIndex, { shadow, shadowColor, inset }),
        touchAction: 'none' // Prevent browser handling of touch events
      }}
      onMouseMove={(e) => {
        if (!layerRef.current) return;
        const rect = layerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        handleTilt(x * 20, y * 20); // Scale tilt effect
      }}
      onMouseLeave={() => handleTilt(0, 0)}
    >
      {children}
      {peekContent}
    </div>
  );
}

// Add SurfaceContent component for elements that should stay at the top level
interface SurfaceContentProps {
  children: React.ReactNode;
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
  offset?: number;
}

export function SurfaceContent({
  children,
  className,
  position = "bottom-right",
  offset = 16
}: SurfaceContentProps) {
  // Position classes based on the requested position
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0", 
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  };

  return (
    <div
      className={cn(
        "absolute z-[200]", // Highest z-index to stay on top
        positionClasses[position],
        className
      )}
      style={{
        padding: `${offset}px`,
        // Force surface level with high z-index and no transform
        transform: 'translateZ(0.1px)',
        transformStyle: 'flat',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

// First, let's add the missing PeekContentProps interface
interface PeekContentProps {
  children: React.ReactNode;
  side?: 'right' | 'left' | 'top' | 'bottom';
  threshold?: number;
  offset?: number;
  tiltX?: number;
  tiltY?: number;
}

// First, let's fix the LayersProps interface
interface LayersProps extends Omit<LayerProps, 'children'> {
  children: React.ReactNode;
  start?: number;
  end?: number;
  reverse?: boolean;
  keyPrefix?: string;
  depthMultiplier?: number;
  varyDepth?: boolean;
}

export function Layers({
  children,
  start = Z_LAYERS.BACKGROUND, // Default to deepest layer
  end = Z_LAYERS.FLOAT,        // Default to shallowest layer
  reverse = false,
  shadow = "medium", // Fix the prop name from shadows to shadow
  shadowColor = "rgba(0,0,0,0.2)",
  className,
  keyPrefix = "layer",
  inset = true,
  depthMultiplier = 0.2, // Default depth multiplier
  varyDepth = true // Default to uniform depth
}: LayersProps) {
  const { distributeZ } = React.useContext(LayerContext);
  const childrenArray = React.Children.toArray(children);
  
  // Calculate z-index distribution
  const zValues = distributeZ(childrenArray.length, start, end);
  
  // Reverse order if requested (useful for stacking elements)
  if (reverse) {
    zValues.reverse();
  }
  
  return (
    <>
      {childrenArray.map((child, index) => {
        const childKey = React.isValidElement(child) && child.key 
          ? child.key.toString().replace(/^\.\$/, '')
          : `${index}`;
          
        // Calculate varying depth if enabled
        const itemDepth = varyDepth 
          ? depthMultiplier * (1 + (index / (childrenArray.length - 1 || 1)) * 0.5) 
          : depthMultiplier;
          
        return (
          <Layer 
            key={`${keyPrefix}-${childKey}`}
            zIndex={zValues[index]}
            shadow={shadow}
            shadowColor={shadowColor}
            className={className}
            inset={inset}
            depth={itemDepth} // Apply depth multiplier
          >
            {child}
          </Layer>
        );
      })}
    </>
  );
}

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
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
  insetMode?: boolean; // Whether to use inset portal effect (default true)
  portalMask?: boolean; // Whether to add a circular mask for portal effect
  portalDepth?: number; // Controls the visual depth of the portal effect
  peekContent?: React.ReactNode; // New prop for content that appears on tilt
  peekThreshold?: number; // Angle threshold to start showing peek content
  maxPeekOffset?: number; // Maximum offset for peek content
}

export function InteractiveCard({
  children,
  expandedContent,
  color = "purple",
  isTrending = false,
  dropShadowIntensity = "medium",
  hoverScale = 1.05,
  hoverTilt = true,
  compact = false,
  enhanced3D = true,
  maxDragDistance = 50,
  perspective = 1000,
  layerMovement = 1.2,
  insetMode = true, // Default to inset portal effect
  portalMask = false, // Optional circular portal mask
  portalDepth = 2, // Default portal depth
  borderColorMap = {
    purple: "border-purple-200 dark:border-purple-800/50",
    blue: "border-blue-200 dark:border-blue-800/50",
    green: "border-green-200 dark:border-green-800/50",
    teal: "border-teal-200 dark:border-teal-800/50",
    indigo: "border-indigo-200 dark:border-indigo-800/50",
    red: "border-red-200 dark:border-red-800/50",
    orange: "border-orange-200 dark:border-orange-800/50",
    yellow: "border-yellow-200 dark:border-yellow-800/50",
    cyan: "border-cyan-200 dark:border-cyan-800/50",
    violet: "border-violet-200 dark:border-violet-800/50",
    pink: "border-pink-200 dark:border-pink-800/50",
    gray: "border-gray-200 dark:border-gray-800/50",
  },
  className,
  peekContent, // New prop for content that appears on tilt
  peekThreshold = 5, // Angle threshold to start showing peek content
  maxPeekOffset = 50, // Maximum offset for peek content
  ...props
}: InteractiveCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isMobile = useIsMobile();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = React.useState<React.CSSProperties>({});
  const [contentStyle, setContentStyle] = React.useState<React.CSSProperties>({});
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartPos = React.useRef({ x: 0, y: 0 });
  const currentDragPos = React.useRef({ x: 0, y: 0 });
  const [tiltAngles, setTiltAngles] = React.useState({ tiltX: 0, tiltY: 0 });
  const [peekStyle, setPeekStyle] = React.useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translate3d(0, 0, 0)',
  });
  
  // Track which peek is most extended
  const [activePeek, setActivePeek] = React.useState<string | null>(null);
  const peekVisibilities = React.useRef<Record<string, number>>({
    right: 0,
    left: 0,
    top: 0,
    bottom: 0
  });
  
  // Method to update peek visibilities and determine which is most extended
  const updatePeekVisibilities = React.useCallback((side: string, visibility: number) => {
    peekVisibilities.current[side] = visibility;
    
    // Find the most visible peek
    const sides = Object.keys(peekVisibilities.current) as Array<keyof typeof peekVisibilities.current>;
    const mostVisibleSide = sides.reduce((most, current) => {
      return peekVisibilities.current[current] > peekVisibilities.current[most] ? current : most;
    }, sides[0]);
    
    // Only set active if visibility exceeds threshold
    const highestVisibility = peekVisibilities.current[mostVisibleSide];
    if (highestVisibility > 0.6) {
      setActivePeek(mostVisibleSide);
    } else {
      setActivePeek(null);
    }
  }, []);
  
  // Track registered layers with options (add inset)
  const [layers, setLayers] = React.useState<{
    [key: string]: { 
      zIndex: number;
      options?: { 
        shadow?: boolean | string;
        shadowColor?: string;
        inset?: boolean;
      }
    }
  }>({});
  
  // Layer management functions (update for inset)
  const registerLayer = React.useCallback((
    id: string, 
    zIndex: number,
    options?: { shadow?: boolean | string, shadowColor?: string, inset?: boolean }
  ) => {
    setLayers(prev => ({...prev, [id]: { zIndex, options }}));
  }, []);
  
  const unregisterLayer = React.useCallback((id: string) => {
    setLayers(prev => {
      const newLayers = {...prev};
      delete newLayers[id];
      return newLayers;
    });
  }, []);
  
  // Helper function to distribute z-index values across a range (update for inset mode)
  const distributeZ = React.useCallback((
    count: number, 
    startZ = Z_LAYERS.BACKGROUND, 
    endZ = Z_LAYERS.FLOAT
  ): number[] => {
    if (count <= 1) return [startZ];
    
    const zValues: number[] = [];
    const step = (endZ - startZ) / (count - 1);
    
    for (let i = 0; i < count; i++) {
      zValues.push(Math.round(startZ + (step * i)));
    }
    
    return zValues;
  }, []);
  
  // Calculate layer style for inset effect
  const getLayerStyle = React.useCallback((
    zIndex: number, 
    options?: { shadow?: boolean | string, shadowColor?: string, inset?: boolean }
  ) => {
    const currentIsMobile = isMobile || window.innerWidth < 768;
    const isInset = options?.inset !== undefined ? options.inset : insetMode;
    
    // Base calculation from contentStyle
    const baseTransform = contentStyle.transform as string || '';
    
    // Extract translation values or default to 0
    const matches = baseTransform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    let translateX = 0;
    let translateY = 0;
    
    if (matches) {
      translateX = Number.parseFloat(matches[1]) || 0;
      translateY = Number.parseFloat(matches[2]) || 0;
      
      // For inset effect, we don't need to invert X translation
      if (!isInset) {
        translateX = -translateX; // Only invert for outset effect
      }
      
      // Enhance z-index based movement calculation
      const maxZ = Math.abs(Z_LAYERS.BACKGROUND);
      const movementFactor = enhanced3D 
        ? Math.max(0.3, Math.min(1.8, Math.abs(zIndex) / maxZ))
        : Math.max(0.2, Math.abs(zIndex) / Math.abs(Z_LAYERS.PRIMARY));
        
      const deviceMultiplier = currentIsMobile ? 1.5 : 1.0;
      
      translateX *= movementFactor * layerMovement * deviceMultiplier;
      translateY *= movementFactor * layerMovement * deviceMultiplier;
    }
    
    // Calculate shadow for inset/outset effect with enhanced depth
    const filterStyles = [];
    
    if (options?.shadow) {
      const shadowIntensity = typeof options.shadow === 'string' 
        ? options.shadow 
        : 'medium';
      
      const shadowColor = options.shadowColor || 'rgba(0,0,0,0.25)'; // Darker default shadow
      const mobileOpacityBoost = currentIsMobile ? 1.5 : 1.0;
      
      // Enhanced shadow opacity for depth
      const baseOpacity = 
        shadowIntensity === 'light' ? 0.15 * mobileOpacityBoost :
        shadowIntensity === 'medium' ? 0.25 * mobileOpacityBoost :
        shadowIntensity === 'heavy' ? 0.35 * mobileOpacityBoost : 0.25 * mobileOpacityBoost;
      
      // For inset effect, deeper elements get more pronounced shadows
      const opacityDirection = isInset ? -1 : 1; // Invert for inset
      const normalizedZ = Math.abs(zIndex) / Math.abs(Z_LAYERS.BACKGROUND);
      const opacityFactor = Math.max(0.6, Math.min(1.8, 1 + (normalizedZ * 0.8 * opacityDirection)));
      const shadowOpacity = baseOpacity * opacityFactor;
      
      // Shadow dimensions - enhanced for inset effect
      const mobileSizeFactor = currentIsMobile ? 1.5 : 1.0;
      const shadowSize = Math.max(1, Math.abs(zIndex) / 2 * mobileSizeFactor);
      const shadowBlur = Math.max(4, Math.abs(zIndex) * 2 * mobileSizeFactor);
      
      // For inset effect, add multiple shadows for more depth
      if (isInset) {
        // Inner shadow effect from top
        filterStyles.push(`drop-shadow(0 ${-shadowSize}px ${shadowBlur}px ${shadowColor.replace(/[\d\.]+\)$/, `${shadowOpacity})`)})`);
        
        // Add a second subtle shadow from the opposite direction for more depth
        const secondaryShadowSize = shadowSize * 0.7;
        const secondaryShadowBlur = shadowBlur * 0.8;
        const secondaryShadowOpacity = shadowOpacity * 0.7;
        filterStyles.push(`drop-shadow(0 ${secondaryShadowSize}px ${secondaryShadowBlur}px ${shadowColor.replace(/[\d\.]+\)$/, `${secondaryShadowOpacity})`)})`);
      } else {
        // Regular drop shadow for outset effect
        filterStyles.push(`drop-shadow(0 ${shadowSize}px ${shadowBlur}px ${shadowColor.replace(/[\d\.]+\)$/, `${shadowOpacity})`)})`);
      }
    }
    
    // For mobile rendering
    const mobileTransformAddition = currentIsMobile ? ' translateZ(0.01px)' : '';
    
    // Base layer style
    const style: React.CSSProperties = {
      transform: `translate3d(${translateX}px, ${translateY}px, ${zIndex}px)${mobileTransformAddition}`,
      transition: contentStyle.transition,
      willChange: 'transform, filter',
      zIndex: isInset ? Math.round(100 + (zIndex * -1)) : Math.round(100 + zIndex), // Invert zIndex ordering for inset
      filter: filterStyles.length > 0 ? filterStyles.join(' ') : undefined,
    };
    
    // Add inset-specific styles
    if (isInset) {
      // For inset effect, add subtle brightness variation based on depth
      if (filterStyles.length === 0) {
        const depthFactor = Math.max(0.92, 1 - (Math.abs(zIndex) / 20 * 0.15));
        style.filter = `brightness(${depthFactor})`;
      }
    }
    
    // Force hardware acceleration on mobile
    if (currentIsMobile) {
      Object.assign(style, {
        WebkitBackfaceVisibility: 'hidden',
        WebkitPerspective: '1000px',
        WebkitTransformStyle: 'preserve-3d',
      });
    }
    
    return style;
  }, [contentStyle, enhanced3D, layerMovement, isMobile, insetMode]);

  // Handle card click to expand dialog
  const handleCardClick = React.useCallback(() => {
    if (!isDragging && expandedContent) {
      setIsExpanded(true);
    }
  }, [expandedContent, isDragging]);

  // Handle drag start
  const handleDragStart = React.useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Don't allow dragging on mobile
    if ('touches' in e || window.innerWidth < 768) return;

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY
    };
    setIsDragging(true);
  }, []);

  // Handle drag
  const handleDrag = React.useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    // Prevent scrolling while dragging on mobile
    if ('touches' in e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let currentX: number;
    let currentY: number;

    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    const deltaX = currentX - dragStartPos.current.x;
    const deltaY = currentY - dragStartPos.current.y;

    // Limit drag distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const scale = distance > maxDragDistance ? maxDragDistance / distance : 1;

    const limitedDeltaX = deltaX * scale;
    const limitedDeltaY = deltaY * scale;

    currentDragPos.current = {
      x: limitedDeltaX,
      y: limitedDeltaY
    };

    const dragStyle = {
      transform: `translate3d(${limitedDeltaX}px, ${limitedDeltaY}px, 0)`,
      transition: 'none',
      cursor: 'grabbing',
      touchAction: 'none', // Prevent scrolling/zooming while dragging
    };

    setTiltStyle(prev => ({
      ...prev,
      ...dragStyle
    }));
  }, [isDragging, maxDragDistance]);

  // Handle drag end with spring animation
  const handleDragEnd = React.useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);

    const springStyle = {
      transform: 'translate3d(0px, 0px, 0) scale(1)',
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy spring effect
      cursor: 'grab',
      touchAction: 'auto', // Re-enable scrolling/zooming
    };

    setTiltStyle(prev => ({
      ...prev,
      ...springStyle
    }));

    // Reset positions
    dragStartPos.current = { x: 0, y: 0 };
    currentDragPos.current = { x: 0, y: 0 };
  }, [isDragging]);

  // Defining shadow classes based on intensity
  const dropShadowClasses = {
    light: "shadow-md hover:shadow-lg dark:shadow-slate-900/20 dark:hover:shadow-slate-900/30",
    medium: "shadow-lg hover:shadow-xl dark:shadow-slate-900/30 dark:hover:shadow-slate-900/40",
    heavy: "shadow-xl hover:shadow-2xl dark:shadow-slate-900/40 dark:hover:shadow-slate-900/50"
  };

  // Handle mouse movement for tilt effect
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverTilt || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    handleTilt(x, y, rect.width, rect.height);
  }, [hoverTilt]);

  // Handle touch movement for tilt effect
  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!cardRef.current || !hoverTilt) return;
    
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate touch point relative to element
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Only handle tilt effect on mobile, no dragging
    handleTilt(x, y, rect.width, rect.height);
  }, [hoverTilt]);

  // Handle touch end to reset tilt and clear initial position
  const handleTouchEnd = React.useCallback(() => {
    if (!hoverTilt) return;
    
    const baseStyle = {
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      willChange: 'transform',
    };
    
    setTiltStyle(baseStyle);
    setContentStyle({
      transform: 'translate3d(0, 0, 0)',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      willChange: 'transform',
    });
    
    // Reset tilt angles
    setTiltAngles({ tiltX: 0, tiltY: 0 });
    
    // Clear initial position
    if (cardRef.current) {
      delete cardRef.current.dataset.initialX;
      delete cardRef.current.dataset.initialY;
    }
  }, [hoverTilt, perspective]);

  // Shared tilt logic with enhanced inset support
  const handleTilt = React.useCallback((x: number, y: number, width: number, height: number) => {
    console.log('Tilt detected:', { x, y, width, height, isMobile });
    
    const currentIsMobile = isMobile || window.innerWidth < 768;
    
    if (cardRef.current && !cardRef.current.dataset.initialX) {
      cardRef.current.dataset.initialX = x.toString();
      cardRef.current.dataset.initialY = y.toString();
    }
    
    const initialX = cardRef.current ? Number.parseFloat(cardRef.current.dataset.initialX || `${width / 2}`) : width / 2;
    const initialY = cardRef.current ? Number.parseFloat(cardRef.current.dataset.initialY || `${height / 2}`) : height / 2;
    
    const moveX = (x - initialX);
    const moveY = (y - initialY);
    
    const maxTiltRange = currentIsMobile ? 20 : 15;
    const maxMovement = Math.min(width, height) / 2;
    
    const tiltX = (moveY / maxMovement) * maxTiltRange * -1;
    const tiltY = (moveX / maxMovement) * maxTiltRange;
    
    const dampening = currentIsMobile ? 0.6 : 0.75;
    const dampedTiltX = tiltX * dampening;
    const dampedTiltY = tiltY * dampening;
    
    // Store tilt angles for portal walls
    setTiltAngles({ tiltX: dampedTiltX, tiltY: dampedTiltY });
    
    const devicePerspective = currentIsMobile ? perspective * 1.2 : perspective;
    
    const baseStyle = {
      transform: `
        perspective(${devicePerspective}px)
        rotateX(${dampedTiltX}deg)
        rotateY(${dampedTiltY}deg)
      `,
      transition: currentIsMobile ? 'transform 0.05s linear' : 'transform 0.08s cubic-bezier(0.215, 0.61, 0.355, 1)',
      willChange: 'transform',
    };
    
    setTiltStyle(baseStyle);
    
    const mobileMovementFactor = currentIsMobile ? 1.5 : 1.0;
    const directionMultiplier = insetMode ? -1 : 1;
    
    const movementScale = Math.min(1.0, (Math.abs(tiltX) + Math.abs(tiltY)) / maxTiltRange);
    
    setContentStyle({
      transform: `translate3d(${dampedTiltY * layerMovement * mobileMovementFactor * directionMultiplier * movementScale}px, ${-dampedTiltX * layerMovement * mobileMovementFactor * directionMultiplier * movementScale}px, 0)`,
      transition: currentIsMobile ? 'transform 0.1s linear' : 'transform 0.12s cubic-bezier(0.215, 0.61, 0.355, 1)',
      willChange: 'transform',
    });

    const tiltMagnitude = Math.sqrt(dampedTiltX * dampedTiltX + dampedTiltY * dampedTiltY);
    const peekProgress = Math.min(Math.max((tiltMagnitude - peekThreshold) / (maxTiltRange - peekThreshold), 0), 1);
    
    console.log('Peek progress:', peekProgress, 'Tilt magnitude:', tiltMagnitude);
    
    const peekX = (dampedTiltY / maxTiltRange) * maxPeekOffset * peekProgress;
    const peekY = (-dampedTiltX / maxTiltRange) * maxPeekOffset * peekProgress;

    setPeekStyle({
      transform: `translate3d(${peekX}px, ${peekY}px, ${portalDepth * 2}px)`,
      transition: currentIsMobile ? 'all 0.1s linear' : 'all 0.12s cubic-bezier(0.215, 0.61, 0.355, 1)',
    });
  }, [perspective, layerMovement, isMobile, insetMode, peekThreshold, maxPeekOffset, portalDepth]);

  // Update reset handlers to clear tilt angles
  const handleMouseLeave = React.useCallback(() => {
    if (!hoverTilt) return;
    
    const baseStyle = {
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      willChange: 'transform',
    };
    
    setTiltStyle(baseStyle);
    setContentStyle({
      transform: 'translate3d(0, 0, 0)',
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      willChange: 'transform',
    });
    
    // Reset tilt angles
    setTiltAngles({ tiltX: 0, tiltY: 0 });
    
    // Clear initial position
    if (cardRef.current) {
      delete cardRef.current.dataset.initialX;
      delete cardRef.current.dataset.initialY;
    }
  }, [hoverTilt, perspective]);

  // Handle touch start for tilt effect with initial position tracking
  const handleTouchStart = React.useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hoverTilt) return;
    
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate touch point relative to element
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Clear previous initial position
    delete cardRef.current.dataset.initialX;
    delete cardRef.current.dataset.initialY;
    
    // Initialize tilt effect
    handleTilt(x, y, rect.width, rect.height);
  }, [hoverTilt, handleTilt]);

  // Layer context value
  const layerContextValue = React.useMemo(() => ({
    registerLayer,
    unregisterLayer,
    getLayerStyle,
    distributeZ,
  }), [registerLayer, unregisterLayer, getLayerStyle, distributeZ]);

  // Determine content padding based on compact/mobile status
  const contentPadding = compact ? '0.75rem' : (isMobile ? '1.25rem' : '1rem');

  // Add custom CSS for the animation
  React.useEffect(() => {
    // Create a style element if it doesn't exist yet
    const styleId = 'peek-animation-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes pulse {
          0% {
            filter: brightness(1);
            transform: scale(1) translateZ(0px);
          }
          100% {
            filter: brightness(1.3);
            transform: scale(1.05) translateZ(10px);
          }
        }
        
        .peek-fully-extended {
          transform-origin: center center;
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Listen for portal actions
    const handlePortalAction = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, direction } = customEvent.detail;
      
      console.log(`Portal action: ${action}, direction: ${direction}`);
      
      // Handle different actions based on direction
      switch (action) {
        case 'navigate-next':
          // Example navigation action
          console.log('Navigating to next item');
          break;
        case 'navigate-previous':
          // Example navigation action
          console.log('Navigating to previous item');
          break;
        case 'expand':
          // Example: Expand card content
          if (expandedContent) {
            setIsExpanded(true);
          }
          break;
        case 'minimize':
          // Example: Minimize card
          setIsExpanded(false);
          break;
      }
    };
    
    window.addEventListener('portal-action', handlePortalAction);
    
    return () => {
      window.removeEventListener('portal-action', handlePortalAction);
    };
  }, [expandedContent]);

  return (
    <>
      <Card
        ref={cardRef}
        className={cn(
          "backdrop-blur-[8px] interactive-card",
          "bg-white/85 dark:bg-slate-900/85",
          "transition-all duration-400",
          "cursor-pointer h-full",
          "transform-style-preserve-3d will-change-transform",
          "relative w-full", // Remove overflow-hidden to allow walls to be visible
          !isMobile && "cursor-grab active:cursor-grabbing",
          "touch-none select-none",
          dropShadowClasses[dropShadowIntensity],
          isTrending ? "ring-2 !ring-amber-400 dark:!ring-amber-500" : "",
          borderColorMap[color],
          insetMode && "portal-card-base",
          portalMask && "portal-card-mask",
          {
            "hover:scale-[1.01]": hoverScale === 1.01 && !isMobile,
            "hover:scale-[1.02]": hoverScale === 1.02 && !isMobile,
            "hover:scale-[1.03]": hoverScale === 1.03 && !isMobile,
            "hover:scale-[1.05]": hoverScale === 1.05 && !isMobile,
            "hover:scale-[1.1]": hoverScale === 1.1 && !isMobile,
          },
          className
        )}
        style={{
          ...tiltStyle,
          perspective: `${perspective}px`,
        }}
        onClick={handleCardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseOut={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {/* Portal walls that appear when tilting - now with tilt angles */}
        <PeekContent 
          side="right" 
          tiltX={tiltAngles.tiltX} 
          tiltY={tiltAngles.tiltY} 
          isActive={activePeek === 'right'}
          onVisibilityChange={(visibility: number) => updatePeekVisibilities('right', visibility)}
        >
          <X className="w-6 h-6" />
        </PeekContent>
        <PeekContent 
          side="left" 
          tiltX={tiltAngles.tiltX} 
          tiltY={tiltAngles.tiltY}
          isActive={activePeek === 'left'}
          onVisibilityChange={(visibility: number) => updatePeekVisibilities('left', visibility)}
        >
          <Stars className="w-6 h-6 text-white" />
        </PeekContent>
        <PeekContent 
          side="top" 
          tiltX={tiltAngles.tiltX} 
          tiltY={tiltAngles.tiltY}
          isActive={activePeek === 'top'}
          onVisibilityChange={(visibility: number) => updatePeekVisibilities('top', visibility)}
        >
          <Search className="w-6 h-6" />
        </PeekContent>
        <PeekContent 
          side="bottom" 
          tiltX={tiltAngles.tiltX} 
          tiltY={tiltAngles.tiltY}
          isActive={activePeek === 'bottom'}
          onVisibilityChange={(visibility: number) => updatePeekVisibilities('bottom', visibility)}
        >
          <ArrowUp className="w-6 h-6" />
        </PeekContent>
        
        {/* Optional depth base for portal effect */}
        {insetMode && portalMask && (
          <div 
            className="absolute inset-0 rounded-lg transform-style-preserve-3d bg-black/5 dark:bg-white/5" 
            style={{ 
              transform: `translateZ(${-portalDepth}px)`,
              zIndex: 1 
            }}
          />
        )}
        
        <CardContent 
          className={cn(
            "relative",
            compact ? "p-3" : "p-4",
            isMobile ? "p-5" : "",
            "sm:p-4",
            "h-full flex flex-col",
            "transform-style-preserve-3d will-change-transform",
            insetMode && "portal-content"
          )}
        >
          {/* Hidden div to maintain container size */}
          <div 
            className={cn(
              "invisible",
              "space-y-2 sm:space-y-3",
              isMobile ? "space-y-3" : "",
              "flex-1"
            )}
          >
            {React.Children.toArray(children)
              .filter(child => !(React.isValidElement(child) && child.type === SurfaceContent))
              .map((child, index) => {
                  const isLayerComponent = React.isValidElement(child) && 
                    (child.type === Layer || child.type === Layers);
                  
                  if (isLayerComponent) {
                    return child;
                  }
                  
                  // Detect if the child is text content or a complex component
                  const isSimpleText = typeof child === 'string' || typeof child === 'number';
                  
                  const defaultZIndex = isMobile 
                    ? Z_LAYERS.PRIMARY * 1.5 
                    : Z_LAYERS.PRIMARY;
                  
                // Generate a stable key based on the child's content or type
                const key = React.isValidElement(child) 
                  ? child.key?.toString() || `layer-${index}`
                  : `layer-${typeof child}-${child}`;
                  
                  return (
                    <Layer 
                    key={key}
                      zIndex={defaultZIndex} 
                      shadow="medium" 
                      shadowColor={isSimpleText ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)"}
                      inset={insetMode}
                      depth={isSimpleText ? 1.2 : 1.0} // Make text appear slightly deeper
                    >
                      {child}
                    </Layer>
                  );
              })
            }
          </div>
          
          {/* Layer context provider with visible content */}
          <LayerContext.Provider value={layerContextValue}>
            <div 
              className={cn(
                "absolute top-0 left-0 right-0",
                "transform-style-preserve-3d will-change-transform",
                "flex flex-col space-y-2 sm:space-y-3",
                isMobile ? "space-y-3" : "",
                "flex-1",
                insetMode && "portal-layers"
              )}
              style={{
                padding: contentPadding,
                pointerEvents: 'auto',
                ...(isMobile && {
                  WebkitTransformStyle: 'preserve-3d',
                }),
              } as React.CSSProperties}
            >
              {React.Children.toArray(children)
                .filter(child => !(React.isValidElement(child) && child.type === SurfaceContent))
                .map((child, index) => {
                  const isLayerComponent = React.isValidElement(child) && 
                    (child.type === Layer || child.type === Layers);
                  
                  if (isLayerComponent) {
                    return child;
                  }
                  
                  // Detect if the child is text content or a complex component
                  const isSimpleText = typeof child === 'string' || typeof child === 'number';
                  
                  const defaultZIndex = isMobile 
                    ? Z_LAYERS.PRIMARY * 1.5 
                    : Z_LAYERS.PRIMARY;
                  
                  // Generate a stable key based on the child's content or type
                  const key = React.isValidElement(child) 
                    ? child.key?.toString() || `layer-${index}`
                    : `layer-${typeof child}-${child}`;
                  
                  return (
                    <Layer 
                      key={key}
                      zIndex={defaultZIndex} 
                      shadow="medium" 
                      shadowColor={isSimpleText ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.2)"}
                      inset={insetMode}
                      depth={isSimpleText ? 1.2 : 1.0} // Make text appear slightly deeper
                    >
                      {child}
                    </Layer>
                  );
                })
                }
            </div>
          </LayerContext.Provider>
          
          {/* Surface level content */}
          {React.Children.map(children, (child) => {
            return React.isValidElement(child) && child.type === SurfaceContent 
              ? child 
              : null;
          })}
        </CardContent>
      </Card>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent
          className={cn(
            "backdrop-blur-lg bg-white/60 dark:bg-slate-800/60",
            "shadow-lg",
            borderColorMap[color],
            isMobile ? "max-w-full w-[98vw]" : "max-w-2xl w-[95vw]",
            "sm:w-full",
            isMobile ? "p-5" : "p-4",
            "sm:p-6",
            "max-h-[90vh] overflow-y-auto",
            "animate-dialogZoomOut",
          )}
        >
          <VisuallyHidden>
            <DialogTitle>Expanded Card</DialogTitle>
          </VisuallyHidden>
          <div className="space-y-3 sm:space-y-4">
            {expandedContent || children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Define gradient directions for each side - flipped orientations
const PEEK_GRADIENT_DIRECTIONS = {
  right: '90deg',   // Left to right (flipped)
  left: '270deg',   // Right to left (flipped)
  top: '0deg',      // Bottom to top (flipped)
  bottom: '180deg', // Top to bottom (flipped)
};

export function PeekContent({
  children,
  side = 'right',
  threshold = 5,
  offset = 50,
  tiltX = 0,
  tiltY = 0,
  style = {},
  isActive = true,
  onVisibilityChange,
}: PeekContentProps & { 
  style?: React.CSSProperties,
  isActive?: boolean,
  onVisibilityChange?: (visibility: number) => void 
}) {
  const isMobile = useIsMobile();
  const [isFullyExtended, setIsFullyExtended] = React.useState(false);
  const extensionTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const extensionThreshold = 0.85; // Threshold to consider wall "fully extended"
  
  // Calculate rotation based on wall side and tilt direction - all flat now
  const rotX = 0;
  const rotY = 0;
  
  // 1. Convert tilt angles to radians and calculate magnitude
  const tiltXRad = (tiltX * Math.PI) / 180;
  const tiltYRad = (tiltY * Math.PI) / 180;
  const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY);
  
  // 2. Calculate visibility using improved tilt calculations
  let visibility = 0;
  
  // Calculate visibility based on wall orientation and tilt direction
  const tiltVector = { 
    x: Math.sin(tiltYRad), 
    y: -Math.sin(tiltXRad),
    z: Math.cos(tiltXRad) * Math.cos(tiltYRad)
  };
  
  // Wall normal vectors point inward toward center of card
  const wallNormals = {
    right: { x: -1, y: 0, z: 0 },
    left: { x: 1, y: 0, z: 0 },
    top: { x: 0, y: 1, z: 0 },
    bottom: { x: 0, y: -1, z: 0 }
  };
  
  // Dot product between tilt vector and wall normal
  const normal = wallNormals[side as keyof typeof wallNormals];
  const dotProduct = tiltVector.x * normal.x + tiltVector.y * normal.y + tiltVector.z * normal.z;
  
  // Wall is visible when dot product is positive (facing away from tilt)
  visibility = Math.max(0, Math.min(1, dotProduct * 2.5));
  
  // 3. Apply non-linear response curve for smoother transition
  visibility = visibility ** 0.6;
  
  // 4. Ensure minimum visibility for UX purposes
  const minVisibility = 0.1;
  const rawVisibility = Math.max(minVisibility, visibility);
  
  // Notify parent component about visibility change
  React.useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(rawVisibility);
    }
  }, [rawVisibility, onVisibilityChange]);
  
  // Apply active state - only show if this is the active peek
  const finalVisibility = isActive ? rawVisibility : 0;
  
  // Track fully extended state with timing threshold to avoid flickering
  React.useEffect(() => {
    // Clear any existing timeout
    if (extensionTimeout.current) {
      clearTimeout(extensionTimeout.current);
      extensionTimeout.current = null;
    }
    
    if (finalVisibility >= extensionThreshold) {
      // If we've reached the threshold, set a timeout to ensure it's not just passing through
      extensionTimeout.current = setTimeout(() => {
        setIsFullyExtended(true);
        // Add gentle vibration feedback when fully extended
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 200); // Short delay to ensure user has intentionally held at full extension
    } else {
      // Below threshold, immediately set to false
      setIsFullyExtended(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (extensionTimeout.current) {
        clearTimeout(extensionTimeout.current);
      }
    };
  }, [finalVisibility]);
  
  // 5. Calculate wall thickness with exponential growth
  const minThickness = 5;
  const maxThickness = 100;
  const thicknessScale = finalVisibility ** 1.5; // Exponential growth for dramatic effect
  const wallThickness = minThickness + ((maxThickness - minThickness) * thicknessScale);
  
  // 6. Calculate wall depth and dimensions based on 3D perspective
  const minDepth = -250;
  const maxDepth = -20;
  
  // Use logistic function for depth transition - creates a sharp "threshold" effect
  const depthTransition = 1 / (1 + Math.exp(-12 * (finalVisibility - 0.5)));
  const depth = minDepth + ((maxDepth - minDepth) * depthTransition);
  
  // 7. Calculate position on card edges with precise vertex placement
  const positionStyle: React.CSSProperties = {};
  const edgeInset = 0; // Removed inset to eliminate gaps
  
  // Define types for the colors
  type ColorValue = [number, number, number];
  type GradientColor = {
    start: ColorValue;
    end: ColorValue;
  };
  type ColorMap = {
    [key: string]: ColorValue | GradientColor;
  };

  // Calculate colors and gradients first
  const colors: ColorMap = {
    right: {
      start: [255, 100, 100], // Red
      end: [128, 128, 128]    // Grey
    },
    left: {
      start: [72, 187, 120],  // Green (swapped from end to start)
      end: [139, 92, 246]     // Purple (swapped from start to end)
    },
    top: [100, 150, 255] as ColorValue,     // Blue
    bottom: [255, 225, 100] as ColorValue,  // Yellow/Gold
  };
  
  const isGradientColor = (color: ColorValue | GradientColor): color is GradientColor => {
    return typeof color === 'object' && 'start' in color && 'end' in color;
  };
  
  const currentColor = colors[side as keyof typeof colors];
  const baseColor = isGradientColor(currentColor) ? currentColor.start : currentColor;
  const endColor = isGradientColor(currentColor) ? currentColor.end : currentColor;
    
  const diffuseFactor = 0.7;
  const lightIntensity = 0.6 + (finalVisibility * 0.3);
  
  // Calculate start color
  const r1 = Math.round(baseColor[0] * lightIntensity * diffuseFactor * 1.1);
  const g1 = Math.round(baseColor[1] * lightIntensity * diffuseFactor * 1.1);
  const b1 = Math.round(baseColor[2] * lightIntensity * diffuseFactor * 1.1);
  
  // Calculate end color
  const r2 = Math.round(endColor[0] * lightIntensity * diffuseFactor * 1.1);
  const g2 = Math.round(endColor[1] * lightIntensity * diffuseFactor * 1.1);
  const b2 = Math.round(endColor[2] * lightIntensity * diffuseFactor * 1.1);

  // Use the start color for the border
  const borderStyle = `2px solid rgba(${r1},${g1},${b1},0.9)`;
  
  // Position wall based on side with extended dimensions and add borders
  if (side === 'right') {
    positionStyle.right = 0;
    positionStyle.top = 0;
    positionStyle.bottom = 0;
    positionStyle.height = '100%';
    positionStyle.width = isActive ? '100%' : `${Math.floor(finalVisibility * 100)}%`;
    positionStyle.transformOrigin = 'right center';
    positionStyle.borderRadius = '8px 0 0 8px';
    positionStyle.borderLeft = borderStyle;
  } else if (side === 'left') {
    positionStyle.left = 0;
    positionStyle.top = 0;
    positionStyle.bottom = 0;
    positionStyle.height = '100%';
    positionStyle.width = isActive ? '100%' : `${Math.floor(finalVisibility * 100)}%`;
    positionStyle.transformOrigin = 'left center';
    positionStyle.borderRadius = '0 8px 8px 0';
    positionStyle.borderRight = borderStyle;
  } else if (side === 'top') {
    positionStyle.top = 0;
    positionStyle.left = 0;
    positionStyle.right = 0;
    positionStyle.width = '100%';
    positionStyle.height = isActive ? '100%' : `${Math.floor(finalVisibility * 100)}%`;
    positionStyle.transformOrigin = 'center top';
    positionStyle.borderRadius = '0 0 8px 8px';
    positionStyle.borderBottom = borderStyle;
  } else if (side === 'bottom') {
    positionStyle.bottom = 0;
    positionStyle.left = 0;
    positionStyle.right = 0;
    positionStyle.width = '100%';
    positionStyle.height = isActive ? '100%' : `${Math.floor(finalVisibility * 100)}%`;
    positionStyle.transformOrigin = 'center bottom';
    positionStyle.borderRadius = '8px 8px 0 0';
    positionStyle.borderTop = borderStyle;
  }
  
  // Add transition for smooth extension to full size when becoming active
  positionStyle.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // 8. Calculate precise 3D transform matrix - simplified for overlay effect
  const baseRotation = 0;
  const minRotation = 0;
  const rotationProgress = 0;
  const rotationAngle = 0;
  const skewX = 0;
  const skewY = 0;

  // 9. Simplified transform for overlay effect - no need for translation since we're growing from edge
  const transform = `translateZ(${depth}px)`;
  
  // 11. Simplified lighting for overlay effect with translucency
  const gradientStart = isActive ? (finalVisibility >= (side === 'top' || side === 'bottom' ? 0.6 : 0.4) ? 0.9 : 0.7) : 0;
  const gradientEnd = isActive ? (finalVisibility >= (side === 'top' || side === 'bottom' ? 0.6 : 0.4) ? 0.4 : 0.25) : 0;
  
  const gradient = isGradientColor(currentColor)
    ? `linear-gradient(
        ${PEEK_GRADIENT_DIRECTIONS[side as keyof typeof PEEK_GRADIENT_DIRECTIONS]},
        rgba(${r1},${g1},${b1},${gradientStart}),
        rgba(${r2},${g2},${b2},${gradientEnd})
      )`
    : `linear-gradient(
        ${PEEK_GRADIENT_DIRECTIONS[side as keyof typeof PEEK_GRADIENT_DIRECTIONS]},
        rgba(${r1},${g1},${b1},${gradientStart}),
        rgba(${r1},${g1},${b1},${gradientEnd})
      )`;
  
  // Calculate glow effects
  const baseGlowSize = 65 + (finalVisibility ** 2 * 75);
  const baseGlowOpacity = 0.2 + (finalVisibility ** 1.2 * 0.25);
  
  // Enhance glow effect when fully extended but keep it subtle
  const pulseAmount = isFullyExtended ? Math.abs(Math.sin(Date.now() / 300) * 0.15) : 0;
  const finalGlowSize = isFullyExtended ? baseGlowSize * (1.15 + pulseAmount) : baseGlowSize;
  const finalGlowOpacity = isFullyExtended ? baseGlowOpacity * (1.2 + pulseAmount) : baseGlowOpacity;
  
  // Create glow effects using the start color
  const glowEffects = {
    primary: `0 0 ${finalGlowSize}px rgba(${r1},${g1},${b1},${finalGlowOpacity})`,
    secondary: `0 0 ${finalGlowSize/2}px rgba(${r1},${g1},${b1},${finalGlowOpacity * 0.5})`
  };
  
  // Handle mouseup event for fully extended walls
  const handleRelease = React.useCallback(() => {
    if (isFullyExtended) {
      console.log(`Wall ${side} released at full extension! Performing action...`);
      
      // Direction-specific actions
      switch(side) {
        case 'right':
          // Navigate to next item/page
          console.log('Action: Navigate Next');
          // Example action - could dispatch a custom event
          window.dispatchEvent(new CustomEvent('portal-action', { 
            detail: { action: 'navigate-next', direction: 'right' } 
          }));
          break;
        case 'left':
          // Navigate to previous item/page
          console.log('Action: Navigate Previous');
          window.dispatchEvent(new CustomEvent('portal-action', { 
            detail: { action: 'navigate-previous', direction: 'left' } 
          }));
          break;
        case 'top':
          // Open details or expand
          console.log('Action: Expand Content');
          window.dispatchEvent(new CustomEvent('portal-action', { 
            detail: { action: 'expand', direction: 'up' } 
          }));
          break;
        case 'bottom':
          // Close or minimize
          console.log('Action: Minimize Content');
          window.dispatchEvent(new CustomEvent('portal-action', { 
            detail: { action: 'minimize', direction: 'down' } 
          }));
          break;
      }
      
      // Add stronger vibration feedback for completed action
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
    }
  }, [isFullyExtended, side]);
  
  // Add window event listeners for mouse and touch up events
  React.useEffect(() => {
    if (isFullyExtended) {
      window.addEventListener('mouseup', handleRelease);
      window.addEventListener('touchend', handleRelease);
      
      return () => {
        window.removeEventListener('mouseup', handleRelease);
        window.removeEventListener('touchend', handleRelease);
      };
    }
  }, [isFullyExtended, handleRelease]);
  
  // Calculate dynamic blur based on opacity
  const baseBlur = 0;
  const maxBlur = 8;
  const dynamicBlur = baseBlur + ((maxBlur - baseBlur) * gradientStart);
  
  // 15. Compile final wall style with all calculated properties
  const wallStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
    transform: `${transform} translateZ(0)`,
    transition: isFullyExtended 
      ? 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: Math.max(0, finalVisibility),
    background: gradient,
    backdropFilter: `blur(${Math.floor(dynamicBlur)}px)`,
    WebkitBackdropFilter: `blur(${Math.floor(dynamicBlur)}px)`,
    overflow: 'hidden',
    fontSize: `${Math.floor(18 + finalVisibility * 15)}px`,
    fontWeight: '700',
    color: 'white',
    textShadow: '0 0 8px rgba(0,0,0,0.8)',
    boxShadow: `${glowEffects.primary}, ${glowEffects.secondary}`,
    willChange: 'transform, opacity, width, height',
    ...positionStyle,
    ...style
  };
  
  // Add subtle scale animation when fully extended
  if (isFullyExtended) {
    const scaleAmount = 1 + Math.sin(Date.now() / 300) * 0.02;
    wallStyles.transform += ` scale(${scaleAmount})`;
  }

  return (
    <div
      className={cn(
        "peek-content portal-wall",
        isFullyExtended && "peek-fully-extended"
      )}
      style={wallStyles}
      data-peek-side={side}
      data-peek-threshold={threshold}
      data-peek-offset={offset}
      data-fully-extended={isFullyExtended}
    >
      <div style={{
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}>
      {children}
      </div>
    </div>
  );
}
