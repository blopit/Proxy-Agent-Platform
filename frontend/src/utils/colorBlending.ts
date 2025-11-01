/**
 * Utility functions for smooth color blending based on percentage values
 */

import { colors } from '@/lib/design-system';

// Color points for battery/energy indicators (using Solarized colors)
const COLOR_POINTS = [
  { percentage: 0, color: colors.base03 },    // Dark background
  { percentage: 50, color: colors.red },      // Red
  { percentage: 65, color: colors.yellow },   // Yellow
  { percentage: 80, color: colors.green },    // Green
  { percentage: 95, color: colors.blue },     // Blue
  { percentage: 100, color: colors.cyan }     // Cyan
];

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Converts RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Interpolates between two colors based on a factor (0-1)
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  
  return rgbToHex(r, g, b);
}

/**
 * Gets a smooth blended color based on percentage (0-100)
 * Uses the predefined color points for smooth transitions
 */
export function getBatteryColor(percentage: number): string {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Find the two color points to interpolate between
  for (let i = 0; i < COLOR_POINTS.length - 1; i++) {
    const currentPoint = COLOR_POINTS[i];
    const nextPoint = COLOR_POINTS[i + 1];
    
    if (clampedPercentage >= currentPoint.percentage && clampedPercentage <= nextPoint.percentage) {
      // Calculate interpolation factor
      const range = nextPoint.percentage - currentPoint.percentage;
      const position = clampedPercentage - currentPoint.percentage;
      const factor = range > 0 ? position / range : 0;
      
      return interpolateColor(currentPoint.color, nextPoint.color, factor);
    }
  }
  
  // Fallback to the last color if percentage is exactly 100
  return COLOR_POINTS[COLOR_POINTS.length - 1].color;
}

/**
 * Gets a smooth blended color for energy levels with custom color points
 * This can be used for different components that need different color schemes
 */
export function getEnergyColor(percentage: number, customColorPoints?: Array<{ percentage: number; color: string }>): string {
  const colorPoints = customColorPoints || COLOR_POINTS;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  for (let i = 0; i < colorPoints.length - 1; i++) {
    const currentPoint = colorPoints[i];
    const nextPoint = colorPoints[i + 1];
    
    if (clampedPercentage >= currentPoint.percentage && clampedPercentage <= nextPoint.percentage) {
      const range = nextPoint.percentage - currentPoint.percentage;
      const position = clampedPercentage - currentPoint.percentage;
      const factor = range > 0 ? position / range : 0;
      
      return interpolateColor(currentPoint.color, nextPoint.color, factor);
    }
  }
  
  return colorPoints[colorPoints.length - 1].color;
}
