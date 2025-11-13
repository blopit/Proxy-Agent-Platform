/**
 * Storybook Control Panel Context
 * Manages state for grid, viewport, sizing, and other storybook controls
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type ComponentSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ViewportConfig {
  name: ViewportSize;
  width: number;
  height: number;
  label: string;
}

export const VIEWPORT_CONFIGS: Record<ViewportSize, ViewportConfig> = {
  mobile: { name: 'mobile', width: 375, height: 667, label: 'Mobile (375×667)' },
  tablet: { name: 'tablet', width: 768, height: 1024, label: 'Tablet (768×1024)' },
  desktop: { name: 'desktop', width: 1440, height: 900, label: 'Desktop (1440×900)' },
  wide: { name: 'wide', width: 1920, height: 1080, label: 'Wide (1920×1080)' },
};

interface ControlPanelState {
  showGrid: boolean;
  viewport: ViewportSize;
  componentSize: ComponentSize;
}

interface ControlPanelContextType extends ControlPanelState {
  setShowGrid: (show: boolean) => void;
  setViewport: (viewport: ViewportSize) => void;
  setComponentSize: (size: ComponentSize) => void;
  toggleGrid: () => void;
}

const ControlPanelContext = createContext<ControlPanelContextType | undefined>(undefined);

export const useControlPanel = () => {
  const context = useContext(ControlPanelContext);
  if (!context) {
    throw new Error('useControlPanel must be used within ControlPanelProvider');
  }
  return context;
};

interface ControlPanelProviderProps {
  children: ReactNode;
}

export const ControlPanelProvider: React.FC<ControlPanelProviderProps> = ({ children }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('mobile');
  const [componentSize, setComponentSize] = useState<ComponentSize>('medium');

  const toggleGrid = () => setShowGrid((prev) => !prev);

  return (
    <ControlPanelContext.Provider
      value={{
        showGrid,
        viewport,
        componentSize,
        setShowGrid,
        setViewport,
        setComponentSize,
        toggleGrid,
      }}
    >
      {children}
    </ControlPanelContext.Provider>
  );
};
