import { useEffect, useRef, useState, useCallback } from 'react';

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersection(
  options: IntersectionOptions = {},
  onIntersect?: (entry: IntersectionObserverEntry) => void
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    setIsIntersecting(entry.isIntersecting);
    
    if (entry.isIntersecting && !hasIntersected) {
      setHasIntersected(true);
      onIntersect?.(entry);
    }
  }, [hasIntersected, onIntersect]);

  useEffect(() => {
    const currentTarget = targetRef.current;
    if (!currentTarget) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with options
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0,
    });

    // Start observing
    observerRef.current.observe(currentTarget);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, options.root, options.rootMargin, options.threshold]);

  return {
    ref: targetRef,
    isIntersecting,
    hasIntersected,
  };
} 