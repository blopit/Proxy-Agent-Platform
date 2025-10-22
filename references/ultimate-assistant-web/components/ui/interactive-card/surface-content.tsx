"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface SurfaceContentProps {
  children: React.ReactNode;
  position?: Position;
  className?: string;
}

const positionClasses: Record<Position, string> = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
};

function SurfaceContentComponent({
  children,
  position = "top-right",
  className,
}: SurfaceContentProps) {
  return (
    <div
      className={cn(
        "absolute z-10",
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
}

export const SurfaceContent = memo(SurfaceContentComponent); 