/**
 * StorageManager - Type-safe AsyncStorage wrapper with error handling
 *
 * Features:
 * - Type-safe get/set operations
 * - Automatic JSON serialization/deserialization
 * - Error handling and logging
 * - Batch operations
 * - Key prefixing for namespacing
 *
 * Usage:
 *   const storage = new StorageManager('user');
 *   await storage.set('profile', { name: 'John' });
 *   const profile = await storage.get<UserProfile>('profile');
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageManager {
  private prefix: string;

  constructor(namespace: string = 'app') {
    this.prefix = `@proxy_agent_${namespace}_`;
  }

  /**
   * Get value from storage with type safety
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(this.getKey(key));
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[StorageManager] Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in storage with automatic serialization
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.getKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageManager] Error setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`[StorageManager] Error removing ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in storage
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.getKey(key));
      return value !== null;
    } catch (error) {
      console.error(`[StorageManager] Error checking ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys in this namespace
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter(k => k.startsWith(this.prefix))
        .map(k => k.replace(this.prefix, ''));
    } catch (error) {
      console.error('[StorageManager] Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Clear all data in this namespace
   */
  async clear(): Promise<boolean> {
    try {
      const keys = await this.getAllKeys();
      const prefixedKeys = keys.map(k => this.getKey(k));
      await AsyncStorage.multiRemove(prefixedKeys);
      return true;
    } catch (error) {
      console.error('[StorageManager] Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Batch get multiple values
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const prefixedKeys = keys.map(k => this.getKey(k));
      const pairs = await AsyncStorage.multiGet(prefixedKeys);

      const result: Record<string, T | null> = {};
      pairs.forEach(([key, value]) => {
        const cleanKey = key.replace(this.prefix, '');
        result[cleanKey] = value ? JSON.parse(value) : null;
      });

      return result;
    } catch (error) {
      console.error('[StorageManager] Error in multiGet:', error);
      return {};
    }
  }

  /**
   * Batch set multiple values
   */
  async multiSet(data: Record<string, unknown>): Promise<boolean> {
    try {
      const pairs: [string, string][] = Object.entries(data).map(([key, value]) => [
        this.getKey(key),
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('[StorageManager] Error in multiSet:', error);
      return false;
    }
  }

  /**
   * Get storage size info (for debugging)
   */
  async getStorageInfo(): Promise<{ keys: number; estimatedSize: number }> {
    try {
      const keys = await this.getAllKeys();
      const data = await this.multiGet(keys);
      const size = JSON.stringify(data).length;

      return {
        keys: keys.length,
        estimatedSize: size,
      };
    } catch (error) {
      console.error('[StorageManager] Error getting storage info:', error);
      return { keys: 0, estimatedSize: 0 };
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

// Pre-configured instances for common namespaces
export const userStorage = new StorageManager('user');
export const taskStorage = new StorageManager('task');
export const cacheStorage = new StorageManager('cache');
export const settingsStorage = new StorageManager('settings');
