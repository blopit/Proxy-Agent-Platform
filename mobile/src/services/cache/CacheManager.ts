/**
 * CacheManager - Smart caching with TTL and invalidation
 *
 * Features:
 * - Time-to-live (TTL) expiration
 * - LRU eviction when cache is full
 * - Automatic stale data handling
 * - Memory and persistent caching
 * - Cache invalidation patterns
 *
 * Usage:
 *   const cache = new CacheManager({ ttl: 300000 }); // 5 minutes
 *   await cache.set('tasks', taskData);
 *   const tasks = await cache.get<Task[]>('tasks');
 */

import { StorageManager } from '../storage/StorageManager';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum number of cache entries (default: 100)
  persistent?: boolean; // Use AsyncStorage for persistence (default: true)
  namespace?: string; // Cache namespace (default: 'cache')
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<unknown>>;
  private storage: StorageManager;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.memoryCache = new Map();
    this.options = {
      ttl: options.ttl ?? 300000, // 5 minutes
      maxSize: options.maxSize ?? 100,
      persistent: options.persistent ?? true,
      namespace: options.namespace ?? 'cache',
    };
    this.storage = new StorageManager(this.options.namespace);
  }

  /**
   * Get value from cache (checks memory first, then persistent storage)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memoryEntry) {
      if (this.isValid(memoryEntry)) {
        return memoryEntry.data;
      } else {
        // Expired - remove from memory
        this.memoryCache.delete(key);
      }
    }

    // Check persistent storage if enabled
    if (this.options.persistent) {
      const entry = await this.storage.get<CacheEntry<T>>(key);
      if (entry && this.isValid(entry)) {
        // Restore to memory cache
        this.memoryCache.set(key, entry);
        return entry.data;
      } else if (entry) {
        // Expired - remove from storage
        await this.storage.remove(key);
      }
    }

    return null;
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const expirationTime = ttl ?? this.options.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationTime,
    };

    // Enforce max size with LRU eviction
    if (this.memoryCache.size >= this.options.maxSize) {
      await this.evictOldest();
    }

    // Set in memory
    this.memoryCache.set(key, entry);

    // Set in persistent storage if enabled
    if (this.options.persistent) {
      await this.storage.set(key, entry);
    }
  }

  /**
   * Remove value from cache
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.options.persistent) {
      await this.storage.remove(key);
    }
  }

  /**
   * Check if cache has valid (non-expired) entry
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.options.persistent) {
      await this.storage.clear();
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidate(pattern: string | RegExp): Promise<void> {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate persistent storage
    if (this.options.persistent) {
      const keys = await this.storage.getAllKeys();
      for (const key of keys) {
        if (regex.test(key)) {
          await this.storage.remove(key);
        }
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memorySize: number;
    persistentSize: number;
    validEntries: number;
    expiredEntries: number;
  }> {
    let validEntries = 0;
    let expiredEntries = 0;

    // Check memory cache
    for (const entry of this.memoryCache.values()) {
      if (this.isValid(entry as CacheEntry<unknown>)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    const persistentSize = this.options.persistent
      ? (await this.storage.getStorageInfo()).keys
      : 0;

    return {
      memorySize: this.memoryCache.size,
      persistentSize,
      validEntries,
      expiredEntries,
    };
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    let removed = 0;

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry as CacheEntry<unknown>)) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    // Clean persistent storage
    if (this.options.persistent) {
      const keys = await this.storage.getAllKeys();
      for (const key of keys) {
        const entry = await this.storage.get<CacheEntry<unknown>>(key);
        if (entry && !this.isValid(entry)) {
          await this.storage.remove(key);
          removed++;
        }
      }
    }

    return removed;
  }

  /**
   * Get or set pattern (fetch if missing)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt;
  }

  private async evictOldest(): Promise<void> {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      const e = entry as CacheEntry<unknown>;
      if (e.timestamp < oldestTime) {
        oldestTime = e.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this.remove(oldestKey);
    }
  }
}

// Pre-configured cache instances
export const apiCache = new CacheManager({
  ttl: 300000, // 5 minutes
  namespace: 'api_cache',
});

export const imageCache = new CacheManager({
  ttl: 3600000, // 1 hour
  namespace: 'image_cache',
});

export const userDataCache = new CacheManager({
  ttl: 600000, // 10 minutes
  namespace: 'user_cache',
});
