/**
 * MemoizationHelpers - React optimization utilities
 *
 * Features:
 * - Enhanced useMemo/useCallback hooks
 * - Shallow/deep equality comparisons
 * - Component memoization helpers
 * - Performance optimization patterns
 *
 * Usage:
 *   const memoizedValue = useMemoDeep(() => expensiveComputation(), [deps]);
 */

import { useRef, useEffect, useMemo, useCallback, DependencyList } from 'react';

/**
 * Deep equality check for objects and arrays
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow equality check for objects
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !keysB.includes(key) ||
      (a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]
    ) {
      return false;
    }
  }

  return true;
}

/**
 * useMemo with deep dependency comparison
 */
export function useMemoDeep<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}

/**
 * useCallback with deep dependency comparison
 */
export function useCallbackDeep<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList
): T {
  const ref = useRef<{ deps: DependencyList; callback: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      callback,
    };
  }

  return ref.current.callback;
}

/**
 * useMemo with shallow dependency comparison
 */
export function useMemoShallow<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T }>();

  if (!ref.current || !shallowEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}

/**
 * Get previous value (useful for comparison)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled value hook
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecuted = now - lastExecuted.current;

    if (timeSinceLastExecuted >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timeoutId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastExecuted);

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Lazy state initialization
 */
export function useLazyState<T>(initializer: () => T): [T, (value: T) => void] {
  const [state, setState] = React.useState<T>(initializer);
  return [state, setState];
}

/**
 * Memoized object creation (prevents reference changes)
 */
export function useMemoizedObject<T extends Record<string, unknown>>(
  obj: T
): T {
  return useMemoShallow(() => obj, Object.values(obj));
}

/**
 * Memoized array creation
 */
export function useMemoizedArray<T>(arr: T[]): T[] {
  return useMemoShallow(() => arr, arr);
}

/**
 * Check if component is mounted
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * Safe setState (only if mounted)
 */
export function useSafeState<T>(
  initialState: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState<T>(initialState);
  const isMounted = useIsMounted();

  const safeSetState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (isMounted()) {
        setState(value);
      }
    },
    [isMounted]
  );

  return [state, safeSetState];
}

/**
 * Memoize expensive computations with cache
 */
export function createMemoizer<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  keyFn?: (...args: TArgs) => string
): (...args: TArgs) => TResult {
  const cache = new Map<string, TResult>();

  return (...args: TArgs) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Fix React import
import React from 'react';
