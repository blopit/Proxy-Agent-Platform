"use client";

import { createContext, memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { get3DStyles } from "../utils/animation";
import type { LayerOptions } from "../portal-types";

type LayerContextType = {
  registerLayer: (id: string, zIndex: number) => void;
  unregisterLayer: (id: string) => void;
  getLayerStyle: (id: string) => Record<string, unknown>;
  getNextZIndex: () => number;
};

export const LayerContext = createContext<LayerContextType | null>(null);

export function useLayerContext() {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error("useLayerContext must be used within a LayerProvider");
  }
  return context;
}

interface LayerComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  zIndex?: number;
  options?: LayerOptions;
}

function LayerComponent({
  children,
  zIndex = 1,
  options,
  className,
  ...props
}: LayerComponentProps) {
  const layerId = useRef(`layer-${Math.random().toString(36).slice(2)}`);
  const context = useContext(LayerContext);

  useEffect(() => {
    if (context) {
      context.registerLayer(layerId.current, zIndex);
      return () => context.unregisterLayer(layerId.current);
    }
  }, [context, zIndex]);

  const style = context
    ? context.getLayerStyle(layerId.current)
    : get3DStyles(zIndex, options);

  return (
    <div className={cn("relative", className)} style={style} {...props}>
      {children}
    </div>
  );
}

interface LayerProviderProps {
  children: React.ReactNode;
}

type LayerState = {
  zIndex: number;
  options?: LayerOptions;
};

function LayerProviderComponent({ children }: LayerProviderProps) {
  const [layers, setLayers] = useState<Record<string, LayerState>>({});
  const nextZIndex = useRef(1);

  const registerLayer = useCallback((id: string, zIndex: number) => {
    setLayers(prev => ({
      ...prev,
      [id]: { zIndex },
    }));
    nextZIndex.current = Math.max(nextZIndex.current, zIndex + 1);
  }, []);

  const unregisterLayer = useCallback((id: string) => {
    setLayers(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getLayerStyle = useCallback((id: string) => {
    const layer = layers[id];
    if (!layer) return {};
    return get3DStyles(layer.zIndex, layer.options);
  }, [layers]);

  const getNextZIndex = useCallback(() => {
    return nextZIndex.current++;
  }, []);

  return (
    <LayerContext.Provider
      value={{
        registerLayer,
        unregisterLayer,
        getLayerStyle,
        getNextZIndex,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
}

export const Layer = memo(LayerComponent);
export const LayerProvider = memo(LayerProviderComponent); 