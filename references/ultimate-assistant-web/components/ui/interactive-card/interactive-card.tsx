"use client";

import { 
  useState, 
  useRef, 
  forwardRef, 
  memo, 
  useMemo, 
  useCallback, 
  useEffect 
} from "react";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Layer, LayerProvider } from "./layer/layer";
import { CardErrorBoundary } from "./error-boundary";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePortal } from "./hooks/use-portal";
import { PortalContent } from "./portal-content";
import { getGPUTransform } from "./utils/animation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { 
  InteractiveCardBaseProps, 
  InteractiveCardPortalProps, 
  PortalCompletionResult 
} from "./portal-types";

type InteractiveCardProps = Omit<InteractiveCardBaseProps, 'children'> & 
  InteractiveCardPortalProps & { 
    children: React.ReactNode;
    className?: string;
    portalClassName?: string;
  };

// Memoize child components to prevent unnecessary re-renders
const MemoizedCard = memo(Card);
const MemoizedDialog = memo(Dialog);
const MemoizedLayer = memo(Layer);

/**
 * Interactive card component with portal peek functionality
 */
export const InteractiveCard = memo(forwardRef<HTMLDivElement, InteractiveCardProps>(
  function InteractiveCard(
    { 
      children, 
      portalContent, 
      activationMode = "hover", 
      hapticFeedback = true, 
      isTrending = false, 
      className, 
      portalClassName,
      onPortalComplete,
      ...props
    },
    ref
  ) {
    const isMobile = useIsMobile();
    const [isHovering, setIsHovering] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    
    // Callbacks for portal state changes - memoized to prevent recreating on each render
    const handleActivate = useCallback(() => setIsHovering(true), []);
    const handleDeactivate = useCallback(() => setIsHovering(false), []);
    
    // Options for usePortal hook
    const portalOptions = useMemo(() => ({
      hapticFeedback,
      activationThreshold: 0.5,
      deactivationDelay: 300,
      onActivate: handleActivate,
      onDeactivate: handleDeactivate
    }), [hapticFeedback, handleActivate, handleDeactivate]);
    
    // Use portal hook with memoized options
    const {
      portalState,
      handlers,
      handlePointerDown,
      handlePointerUp,
      handlePointerMove
    } = usePortal(portalOptions);

    // Memoize the portal completion handler
    const handlePortalComplete = useCallback((result: PortalCompletionResult) => {
      if (onPortalComplete) {
        onPortalComplete(result);
        return;
      }
      
      if (result.action === 'message') {
        toast.success("Portal Activated!", {
          description: result.message || "Portal activated!"
        });
      } else if (result.action === 'dialog') {
        if (!isMobile) {
          toast.info("Portal Activated!", {
            description: "Opening dialog..."
          });
        }
      }
    }, [isMobile, onPortalComplete]);
    
    // Memoize class names to prevent recalculations
    const cardClasses = useMemo(() => cn(
      "interactive-card relative rounded-lg bg-white dark:bg-slate-900 shadow-md overflow-hidden",
      "transform-gpu hover-transition",
      isHovering && "scale-[1.02] shadow-lg",
      "touch-none",
      className
    ), [className, isHovering]);
    
    const portalContentClasses = useMemo(() => cn(
      "absolute inset-0 z-20 flex items-center justify-center",
      portalState.isFullyActivated && "portal-fully-activated portal-active-glow",
      portalState.isActive ? "pointer-events-auto" : "pointer-events-none",
      portalClassName
    ), [portalClassName, portalState.isActive, portalState.isFullyActivated]);
    
    const innerContentClasses = useMemo(() => cn(
      "relative transform-gpu transition-transform duration-300",
      portalState.isFullyActivated && "scale-110"
    ), [portalState.isFullyActivated]);

    // Optimization: Track if we should render portal content
    const shouldRenderPortalContent = portalContent !== undefined;

    // Optimize render control by tracking visible state
    const visibilityThreshold = 0.02;
    const isVisible = useMemo(() => 
      portalState.visibility > visibilityThreshold || 
      portalState.isActive || 
      portalState.isTransitioning,
      [portalState.visibility, portalState.isActive, portalState.isTransitioning]
    );

    // Create passive pointer event listeners for better performance on mobile
    const passiveEvents = useMemo(() => ({
      // Pointer events for modern devices
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'touch' && e.isPrimary) {
          e.preventDefault();
        }
        handlePointerDown(e);
      },
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      
      // Traditional events as fallback and for specific behavior
      ...handlers,
      
      // CSS hint for browser optimization
      style: { touchAction: 'none' }
    }), [handlePointerDown, handlePointerUp, handlePointerMove, handlers]);

    // Memoize GPU transform styles
    const gpuTransformStyle = useMemo(() => getGPUTransform(0, 0), []);

    // Memoize the card content to prevent unnecessary rerenders
    const cardContent = useMemo(() => (
      <MemoizedCard className="w-full h-full">
        {children}
      </MemoizedCard>
    ), [children]);

    // Memoize mobile dialog content
    const mobileDialogContent = useMemo(() => (
      portalState.isActive ? (
        <MemoizedDialog open={true}>
          {portalContent}
        </MemoizedDialog>
      ) : null
    ), [portalState.isActive, portalContent]);

    // Memoize desktop portal content
    const desktopPortalContent = useMemo(() => portalContent, [portalContent]);

    // Use intersection observer to optimize off-screen rendering
    const [isInViewport, setIsInViewport] = useState(false);
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInViewport(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      const currentRef = elementRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }
      
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
        observer.disconnect();
      };
    }, []);

    // Performance optimized render
    return (
      <CardErrorBoundary>
        <LayerProvider>
          <div
            ref={ref || elementRef}
            className={cardClasses}
            {...passiveEvents}
            {...props}
          >
            <MemoizedLayer zIndex={1} options={{ shadow: "medium" }}>
              <div
                className="relative w-full h-full transition-transform duration-300 ease-out transform-gpu will-change-transform"
                style={gpuTransformStyle}
              >
                {cardContent}

                {/* Only render portal when needed and card is in viewport */}
                {shouldRenderPortalContent && isInViewport && (isVisible || portalState.activationProgress > 0) && (
                  <PortalContent
                    portalState={portalState}
                    className={portalContentClasses}
                    onPortalComplete={handlePortalComplete}
                  >
                    <div className={innerContentClasses}>
                      {isMobile ? mobileDialogContent : desktopPortalContent}
                    </div>
                  </PortalContent>
                )}
              </div>
            </MemoizedLayer>
          </div>
        </LayerProvider>
      </CardErrorBoundary>
    );
  }
));

InteractiveCard.displayName = "InteractiveCard"; 