/**
 * useReducedMotion Hook
 *
 * Detects if the user has requested reduced motion via system preferences.
 * Essential for WCAG 2.1 Level AA compliance (Motion Actuation).
 *
 * Usage:
 * ```tsx
 * const shouldReduceMotion = useReducedMotion();
 *
 * <motion.div
 *   animate={{ scale: shouldReduceMotion ? 1 : 1.2 }}
 *   transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
 * />
 *
 * // Or in CSS
 * <div style={{
 *   transition: shouldReduceMotion ? 'none' : 'all 0.3s ease'
 * }} />
 * ```
 *
 * @returns {boolean} True if user prefers reduced motion
 */

'use client';

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Query media for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial state
    setShouldReduceMotion(mediaQuery.matches);

    // Listen for changes (user can toggle system preference while app is running)
    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return shouldReduceMotion;
}

export default useReducedMotion;
