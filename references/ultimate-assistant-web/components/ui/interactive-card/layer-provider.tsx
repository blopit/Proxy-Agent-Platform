"use client";

import { memo, useCallback, useRef, useState } from "react";
import { LayerContext } from "./layer";
import { get3DStyles } from "./utils/animation";
import type { LayerOptions } from "./portal-types";

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

export const LayerProvider = memo(LayerProviderComponent); 