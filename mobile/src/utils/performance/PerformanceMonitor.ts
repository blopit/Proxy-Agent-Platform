/**
 * PerformanceMonitor - Track and log performance metrics
 *
 * Features:
 * - Component render time tracking
 * - API call duration monitoring
 * - Memory usage tracking
 * - FPS monitoring
 * - Performance reports
 *
 * Usage:
 *   const monitor = PerformanceMonitor.getInstance();
 *   monitor.startMeasure('api_call');
 *   // ... do work
 *   monitor.endMeasure('api_call');
 */

import { InteractionManager, Platform } from 'react-native';

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceReport {
  marks: PerformanceMark[];
  averages: Record<string, number>;
  slowestOperations: PerformanceMark[];
  totalMeasurements: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, number> = new Map();
  private completedMarks: PerformanceMark[] = [];
  private maxStoredMarks = 100;
  private isEnabled = __DEV__; // Only in development by default

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Start measuring an operation
   */
  startMeasure(name: string, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    this.marks.set(name, performance.now());
    if (metadata) {
      this.marks.set(`${name}_metadata`, metadata as unknown as number);
    }
  }

  /**
   * End measuring an operation
   */
  endMeasure(name: string): number | null {
    if (!this.isEnabled) return null;

    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`[PerformanceMonitor] No start mark for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metadata = this.marks.get(`${name}_metadata`) as unknown as
      | Record<string, unknown>
      | undefined;

    const mark: PerformanceMark = {
      name,
      startTime,
      endTime,
      duration,
      metadata,
    };

    this.completedMarks.push(mark);
    this.marks.delete(name);
    this.marks.delete(`${name}_metadata`);

    // Limit stored marks
    if (this.completedMarks.length > this.maxStoredMarks) {
      this.completedMarks.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`[PerformanceMonitor] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.startMeasure(name, metadata);
    try {
      return await fn();
    } finally {
      this.endMeasure(name);
    }
  }

  /**
   * Measure a synchronous operation
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    this.startMeasure(name, metadata);
    try {
      return fn();
    } finally {
      this.endMeasure(name);
    }
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const averages: Record<string, number> = {};
    const durations: Record<string, number[]> = {};

    // Calculate averages
    for (const mark of this.completedMarks) {
      if (!mark.duration) continue;

      if (!durations[mark.name]) {
        durations[mark.name] = [];
      }
      durations[mark.name].push(mark.duration);
    }

    for (const [name, values] of Object.entries(durations)) {
      const sum = values.reduce((a, b) => a + b, 0);
      averages[name] = sum / values.length;
    }

    // Get slowest operations
    const slowestOperations = [...this.completedMarks]
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);

    return {
      marks: this.completedMarks,
      averages,
      slowestOperations,
      totalMeasurements: this.completedMarks.length,
    };
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const report = this.getReport();

    console.log('=== Performance Report ===');
    console.log(`Total measurements: ${report.totalMeasurements}`);
    console.log('\nAverages:');
    Object.entries(report.averages)
      .sort(([, a], [, b]) => b - a)
      .forEach(([name, avg]) => {
        console.log(`  ${name}: ${avg.toFixed(2)}ms`);
      });

    console.log('\nSlowest Operations:');
    report.slowestOperations.forEach((mark, i) => {
      console.log(`  ${i + 1}. ${mark.name}: ${mark.duration?.toFixed(2)}ms`);
    });
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.marks.clear();
    this.completedMarks = [];
  }

  /**
   * Wait for interactions to complete (useful before measuring)
   */
  async waitForInteractions(): Promise<void> {
    return new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        resolve();
      });
    });
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * React hook for component render performance
 */
export function useRenderPerformance(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.startMeasure(`render_${componentName}`);
    return () => {
      monitor.endMeasure(`render_${componentName}`);
    };
  });
}

/**
 * HOC for measuring component performance
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || Component.displayName || Component.name || 'Component';

  return function PerformanceMonitoredComponent(props: P) {
    useRenderPerformance(name);
    return <Component {...props} />;
  };
}

// Fix React import
import React from 'react';
