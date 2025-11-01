'use client'

import React, { useMemo } from 'react';

interface LayerProps {
  children: React.ReactNode;
  zIndex?: number;
  depth?: number;
  shadow?: 'none' | 'light' | 'medium' | 'heavy';
  className?: string;
}

/**
 * Layer component for creating 3D depth effects in card stacks
 * Uses CSS transforms and shadows to create parallax depth
 */
export const Layer: React.FC<LayerProps> = ({
  children,
  zIndex = 0,
  depth = 0,
  shadow = 'none',
  className = ''
}) => {
  // Calculate transform based on depth
  const transform = useMemo(() => {
    if (depth === 0) return 'translateZ(0px)';
    return `translateZ(${depth}px)`;
  }, [depth]);

  // Shadow styles based on depth and shadow prop
  const shadowStyle = useMemo(() => {
    if (shadow === 'none') return 'none';

    const shadowMap = {
      light: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
      heavy: '0 8px 16px rgba(0, 0, 0, 0.2)'
    };

    return shadowMap[shadow];
  }, [shadow]);

  const style = useMemo(() => ({
    transform,
    zIndex,
    boxShadow: shadowStyle,
    willChange: 'transform',
    transformStyle: 'preserve-3d' as const,
  }), [transform, zIndex, shadowStyle]);

  return (
    <div className={`layer ${className}`} style={style}>
      {children}
    </div>
  );
};

interface LayersProps {
  children: React.ReactNode[];
  spacing?: number;
  shadowIntensity?: 'none' | 'light' | 'medium' | 'heavy';
  className?: string;
}

/**
 * Layers component for automatically stacking multiple Layer components
 */
export const Layers: React.FC<LayersProps> = ({
  children,
  spacing = 5,
  shadowIntensity = 'light',
  className = ''
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={`layers-container ${className}`}>
      {childArray.map((child, index) => (
        <Layer
          key={index}
          zIndex={index}
          depth={index * spacing}
          shadow={shadowIntensity}
        >
          {child}
        </Layer>
      ))}
    </div>
  );
};
