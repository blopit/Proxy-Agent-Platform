/**
 * SyncQueue - Offline operation queue with automatic retry
 *
 * Features:
 * - Queue operations when offline
 * - Automatic retry with exponential backoff
 * - Persistent queue across app restarts
 * - Network status monitoring
 * - Operation deduplication
 *
 * Usage:
 *   const queue = SyncQueue.getInstance();
 *   await queue.enqueue('createTask', { title: 'New task' });
 */

import NetInfo from '@react-native-community/netinfo';
import { StorageManager } from '../storage/StorageManager';

export interface SyncOperation {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
  lastAttempt?: number;
}

export type OperationHandler = (payload: unknown) => Promise<void>;

export class SyncQueue {
  private static instance: SyncQueue;
  private queue: SyncOperation[] = [];
  private storage: StorageManager;
  private handlers: Map<string, OperationHandler> = new Map();
  private isProcessing = false;
  private isOnline = true;
  private unsubscribeNetInfo?: () => void;

  private constructor() {
    this.storage = new StorageManager('sync_queue');
    this.initializeNetworkMonitoring();
    this.loadQueue();
  }

  static getInstance(): SyncQueue {
    if (!SyncQueue.instance) {
      SyncQueue.instance = new SyncQueue();
    }
    return SyncQueue.instance;
  }

  /**
   * Register operation handler
   */
  registerHandler(type: string, handler: OperationHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Add operation to queue
   */
  async enqueue(
    type: string,
    payload: unknown,
    options: { maxRetries?: number; dedupeKey?: string } = {}
  ): Promise<string> {
    const operation: SyncOperation = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
    };

    // Check for duplicate operations
    if (options.dedupeKey) {
      const existing = this.queue.find(
        op => op.type === type && this.getDedupeKey(op) === options.dedupeKey
      );
      if (existing) {
        console.log(`[SyncQueue] Skipping duplicate operation: ${options.dedupeKey}`);
        return existing.id;
      }
    }

    this.queue.push(operation);
    await this.saveQueue();

    // Process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return operation.id;
  }

  /**
   * Remove operation from queue
   */
  async remove(operationId: string): Promise<boolean> {
    const index = this.queue.findIndex(op => op.id === operationId);
    if (index === -1) return false;

    this.queue.splice(index, 1);
    await this.saveQueue();
    return true;
  }

  /**
   * Get all pending operations
   */
  getPending(): SyncOperation[] {
    return [...this.queue];
  }

  /**
   * Get operations by type
   */
  getByType(type: string): SyncOperation[] {
    return this.queue.filter(op => op.type === type);
  }

  /**
   * Clear all operations
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Force process queue (useful for testing)
   */
  async forceProcess(): Promise<void> {
    await this.processQueue();
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    failedRetries: number;
  } {
    const byType: Record<string, number> = {};
    let failedRetries = 0;

    for (const op of this.queue) {
      byType[op.type] = (byType[op.type] || 0) + 1;
      if (op.retries >= op.maxRetries) {
        failedRetries++;
      }
    }

    return {
      total: this.queue.length,
      byType,
      failedRetries,
    };
  }

  /**
   * Cleanup - stop network monitoring
   */
  cleanup(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }

  private async initializeNetworkMonitoring(): Promise<void> {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    // Subscribe to network changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Process queue when coming back online
      if (wasOffline && this.isOnline) {
        console.log('[SyncQueue] Network restored, processing queue');
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline) return;
    if (this.queue.length === 0) return;

    this.isProcessing = true;
    console.log(`[SyncQueue] Processing ${this.queue.length} operations`);

    const operations = [...this.queue];

    for (const operation of operations) {
      // Skip if max retries exceeded
      if (operation.retries >= operation.maxRetries) {
        console.error(`[SyncQueue] Max retries exceeded for ${operation.type}`);
        continue;
      }

      // Check if we should retry based on exponential backoff
      if (operation.lastAttempt) {
        const backoffTime = Math.pow(2, operation.retries) * 1000; // 1s, 2s, 4s, 8s
        const timeSinceLastAttempt = Date.now() - operation.lastAttempt;
        if (timeSinceLastAttempt < backoffTime) {
          continue; // Too soon to retry
        }
      }

      const handler = this.handlers.get(operation.type);
      if (!handler) {
        console.error(`[SyncQueue] No handler for operation type: ${operation.type}`);
        continue;
      }

      try {
        await handler(operation.payload);
        console.log(`[SyncQueue] Successfully processed ${operation.type}`);
        await this.remove(operation.id);
      } catch (error) {
        console.error(`[SyncQueue] Error processing ${operation.type}:`, error);
        operation.retries++;
        operation.lastAttempt = Date.now();
        await this.saveQueue();
      }
    }

    this.isProcessing = false;

    // Process again if there are still items and we're online
    if (this.queue.length > 0 && this.isOnline) {
      setTimeout(() => this.processQueue(), 5000); // Retry after 5 seconds
    }
  }

  private async loadQueue(): Promise<void> {
    const queue = await this.storage.get<SyncOperation[]>('queue');
    if (queue) {
      this.queue = queue;
      console.log(`[SyncQueue] Loaded ${queue.length} operations from storage`);
    }
  }

  private async saveQueue(): Promise<void> {
    await this.storage.set('queue', this.queue);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDedupeKey(operation: SyncOperation): string {
    return JSON.stringify({ type: operation.type, payload: operation.payload });
  }
}

// Singleton instance
export const syncQueue = SyncQueue.getInstance();
