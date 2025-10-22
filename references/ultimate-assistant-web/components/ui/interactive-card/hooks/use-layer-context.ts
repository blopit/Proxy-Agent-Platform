import { createContext, useContext, useCallback, useState } from 'react';
import type { LayerContextType } from '../types';
import { Z_LAYERS } from '../constants';

// Create the context with a meaningful default value
export const LayerContext = createContext<LayerContextType>({
  registerLayer: () => {},
  unregisterLayer: () => {},
  getLayerStyle: () => ({}),
  distributeZ: () => [],
});

interface LayerInfo {
  zIndex: number;
  shadow?: boolean | string;
  shadowColor?: string;
  inset?: boolean;
}

interface UseLayerContextReturn extends LayerContextType {
  layers: Map<string, LayerInfo>;
}

export function useLayerContext(): UseLayerContextReturn {
  const [layers] = useState(() => new Map<string, LayerInfo>());

  const registerLayer = useCallback((
    id: string,
    zIndex: number,
    options?: { shadow?: boolean | string; shadowColor?: string; inset?: boolean }
  ) => {
    layers.set(id, { zIndex, ...options });
  }, [layers]);

  const unregisterLayer = useCallback((id: string) => {
    layers.delete(id);
  }, [layers]);

  const getLayerStyle = useCallback((
    zIndex: number,
    options?: { shadow?: boolean | string; shadowColor?: string; inset?: boolean }
  ): React.CSSProperties => {
    const { shadow = 'medium', shadowColor = 'rgba(0,0,0,0.2)', inset = true } = options || {};

    // Calculate shadow based on z-index and options
    let boxShadow = '';
    if (shadow) {
      const shadowSize = typeof shadow === 'string' ? {
        light: 4,
        medium: 8,
        heavy: 12
      }[shadow] || 8 : 8;

      const shadowOffset = Math.abs(zIndex) * 0.1;
      const blurRadius = shadowSize * (1 + Math.abs(zIndex) * 0.05);
      const spreadRadius = shadowSize * 0.25;

      if (inset) {
        boxShadow = `inset 0 ${shadowOffset}px ${blurRadius}px ${spreadRadius}px ${shadowColor}`;
      } else {
        boxShadow = `0 ${shadowOffset}px ${blurRadius}px ${spreadRadius}px ${shadowColor}`;
      }
    }

    return {
      zIndex,
      boxShadow,
      position: 'relative',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    };
  }, []);

  const distributeZ = useCallback((
    count: number,
    startZ: number = Z_LAYERS.BACKGROUND,
    endZ: number = Z_LAYERS.FLOAT
  ): number[] => {
    if (count <= 1) return [startZ];
    
    const step = (endZ - startZ) / (count - 1);
    return Array.from({ length: count }, (_, i) => startZ + step * i);
  }, []);

  return {
    layers,
    registerLayer,
    unregisterLayer,
    getLayerStyle,
    distributeZ,
  };
}

// Hook to use the layer context
export function useLayer() {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayer must be used within a LayerContext.Provider');
  }
  return context;
} 