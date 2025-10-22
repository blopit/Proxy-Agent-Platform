"use client";

import { memo, type ReactNode } from "react";
import { Card } from "../card";
import { Dialog } from "../dialog";
import { Layer, LayerProvider } from "./layer/layer";
import { CardErrorBoundary } from "./error-boundary";
import { useIsMobile } from "../../../hooks/use-is-mobile";
import { usePortal } from "./hooks";
import { PortalContent } from "./portal-content";
import { getGPUTransform } from "./utils/animation";
import { cn } from "../../../lib/utils";
import type { InteractiveCardBaseProps, InteractiveCardPortalProps } from "./portal-types";

type InteractiveCardProps = InteractiveCardBaseProps & InteractiveCardPortalProps;

type DivHandlers = {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: TouchEventHandler<HTMLDivElement>;
  onTouchMove?: TouchEventHandler<HTMLDivElement>;
  onTouchEnd?: TouchEventHandler<HTMLDivElement>;
  onClick?: () => void;
};

const MemoizedCard = memo(Card);
const MemoizedDialog = memo(Dialog);
const MemoizedLayer = memo(Layer);
const MemoizedPortalContent = memo(PortalContent);

function InteractiveCardComponent({
  children,
  portalContent,
  activationMode = "touch",
  hapticFeedback = true,
  className,
  ...props
}: InteractiveCardProps) {
  const isMobile = useIsMobile();
  const { portalState, handlers } = usePortal(activationMode, hapticFeedback);
  
  return (
    <CardErrorBoundary>
      <LayerProvider>
        <MemoizedLayer zIndex={1} options={{ shadow: "medium" }}>
          <div
            className={cn(
              "relative w-full h-full",
              "transition-transform duration-300 ease-out",
              portalState.activationProgress > 0 && "cursor-grab active:cursor-grabbing",
              className
            )}
            style={getGPUTransform(0, 0)}
            {...handlers as unknown as DivHandlers}
          >
            {/* Visual indicator for touch start zone */}
            <div className={cn(
              "absolute inset-0 pointer-events-none",
              "flex items-center justify-center",
              "opacity-0 transition-opacity duration-200",
              !portalState.isActive && "hover:opacity-20"
            )}>
              <div className={cn(
                "w-1/3 h-1/3 rounded-full border-2 border-dashed border-current",
                portalState.activationProgress > 0 && "scale-90 opacity-50"
              )} />
            </div>

            {/* Direction indicators */}
            {portalState.activationProgress > 0 && (
              <>
                <div className={cn(
                  "absolute inset-x-0 top-0 h-12 pointer-events-none",
                  "flex items-center justify-center",
                  "transition-opacity duration-200",
                  portalState.activeDirection === 'top' ? 'opacity-100' : 'opacity-30'
                )}>
                  <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                </div>
                <div className={cn(
                  "absolute inset-x-0 bottom-0 h-12 pointer-events-none",
                  "flex items-center justify-center",
                  "transition-opacity duration-200",
                  portalState.activeDirection === 'bottom' ? 'opacity-100' : 'opacity-30'
                )}>
                  <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                </div>
                <div className={cn(
                  "absolute inset-y-0 left-0 w-12 pointer-events-none",
                  "flex items-center justify-center",
                  "transition-opacity duration-200",
                  portalState.activeDirection === 'left' ? 'opacity-100' : 'opacity-30'
                )}>
                  <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                </div>
                <div className={cn(
                  "absolute inset-y-0 right-0 w-12 pointer-events-none",
                  "flex items-center justify-center",
                  "transition-opacity duration-200",
                  portalState.activeDirection === 'right' ? 'opacity-100' : 'opacity-30'
                )}>
                  <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                </div>
              </>
            )}

            <MemoizedCard className="w-full h-full" {...props}>
              {children}
            </MemoizedCard>

            {portalContent && (
              <MemoizedPortalContent
                isActive={portalState.isActive}
                isTransitioning={portalState.isTransitioning}
                direction={portalState.activeDirection}
              >
                {isMobile ? (
                  <MemoizedDialog open={portalState.isActive}>
                    {portalContent}
                  </MemoizedDialog>
                ) : (
                  portalContent
                )}
              </MemoizedPortalContent>
            )}
          </div>
        </MemoizedLayer>
      </LayerProvider>
    </CardErrorBoundary>
  );
}

export const InteractiveCard = memo(InteractiveCardComponent); 