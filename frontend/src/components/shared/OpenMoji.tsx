/**
 * OpenMoji - Consistent emoji rendering using OpenMoji SVGs
 *
 * Renders emojis as black & white line art or color SVGs from the OpenMoji library.
 * Uses CDN for efficient delivery without bundling large SVG files.
 *
 * Usage:
 * <OpenMoji emoji="📝" size={20} variant="black" />
 * <OpenMoji emoji="✅" size={24} variant="color" />
 */

'use client';

import React from 'react';

export interface OpenMojiProps {
  emoji: string;
  size?: number;
  className?: string;
  variant?: 'color' | 'black';
  engraved?: boolean;
  embossed?: boolean;
}

export const OpenMoji: React.FC<OpenMojiProps> = ({
  emoji,
  size = 16,
  className = '',
  variant = 'black',
  engraved = false,
  embossed = false
}) => {
  // Convert emoji to Unicode hex code point (handles multi-byte emojis)
  const getHexCode = (emoji: string) => {
    const codePoint = emoji.codePointAt(0);
    if (!codePoint) return '';
    // Pad to at least 4 digits, but allow more for emojis that need it
    const hex = codePoint.toString(16).toUpperCase();
    return hex.length < 4 ? hex.padStart(4, '0') : hex;
  };

  const hexCode = getHexCode(emoji);
  // Use OpenMoji CDN with black (line art) or color version
  const cdnUrl = `https://cdn.jsdelivr.net/npm/openmoji@15.0.0/${variant}/svg/${hexCode}.svg`;

  // Determine which 3D effect to apply
  let filterEffect: string | undefined;

  if (engraved) {
    // Engraved/debossed effect (carved in): dark shadow above, light highlight below
    filterEffect = 'drop-shadow(0 -1px 0px rgba(0, 0, 0, 0.4)) drop-shadow(0 1px 0px rgba(255, 255, 255, 0.4)) opacity(0.7)';
  } else if (embossed) {
    // Embossed/raised effect (popping out): light highlight above, dark shadow below
    filterEffect = 'drop-shadow(0 -1px 1px rgba(255, 255, 255, 0.6)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3)) brightness(1.1)';
  }

  return (
    <img
      src={cdnUrl}
      alt={emoji}
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        flexShrink: 0,
        filter: filterEffect,
        verticalAlign: 'middle',
      }}
      onError={(e) => {
        // Fallback to showing the emoji text if SVG fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createTextNode(emoji);
        target.parentNode?.appendChild(fallback);
      }}
    />
  );
};

export default OpenMoji;
