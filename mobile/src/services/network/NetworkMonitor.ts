/**
 * NetworkMonitor - Monitor network status and quality
 *
 * Features:
 * - Real-time network status monitoring
 * - Connection quality detection (wifi, cellular, etc.)
 * - Network type awareness
 * - Observable pattern for UI updates
 *
 * Usage:
 *   const monitor = NetworkMonitor.getInstance();
 *   monitor.subscribe(status => {
 *     console.log('Network:', status.isConnected);
 *   });
 */

import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  type: NetInfoStateType;
  isInternetReachable: boolean | null;
  details: {
    isWifi: boolean;
    isCellular: boolean;
    isEthernet: boolean;
    strength?: number; // 0-100 for cellular
  };
}

export type NetworkCallback = (status: NetworkStatus) => void;

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private subscribers: Set<NetworkCallback> = new Set();
  private currentStatus: NetworkStatus;
  private unsubscribe?: () => void;

  private constructor() {
    this.currentStatus = this.getDefaultStatus();
    this.initialize();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentStatus.isConnected;
  }

  /**
   * Check if on WiFi
   */
  isWifi(): boolean {
    return this.currentStatus.details.isWifi;
  }

  /**
   * Check if on cellular
   */
  isCellular(): boolean {
    return this.currentStatus.details.isCellular;
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(callback: NetworkCallback): () => void {
    this.subscribers.add(callback);

    // Immediately call with current status
    callback(this.currentStatus);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Wait for network connection
   */
  async waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeoutMs);

      const unsubscribe = this.subscribe((status) => {
        if (status.isConnected) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Refresh network status
   */
  async refresh(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    this.updateStatus(state);
    return this.currentStatus;
  }

  /**
   * Cleanup - stop monitoring
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.subscribers.clear();
  }

  private async initialize(): Promise<void> {
    // Get initial state
    const state = await NetInfo.fetch();
    this.updateStatus(state);

    // Subscribe to changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.updateStatus(state);
    });
  }

  private updateStatus(state: NetInfoState): void {
    const previousStatus = this.currentStatus;

    this.currentStatus = {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
      details: {
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        isEthernet: state.type === 'ethernet',
        strength:
          state.type === 'cellular' && 'details' in state && state.details
            ? (state.details as { cellularGeneration?: string }).cellularGeneration
              ? 75 // Approximate strength
              : undefined
            : undefined,
      },
    };

    // Notify subscribers if status changed
    if (this.hasStatusChanged(previousStatus, this.currentStatus)) {
      this.notifySubscribers();
    }
  }

  private hasStatusChanged(prev: NetworkStatus, current: NetworkStatus): boolean {
    return (
      prev.isConnected !== current.isConnected ||
      prev.type !== current.type ||
      prev.isInternetReachable !== current.isInternetReachable
    );
  }

  private notifySubscribers(): void {
    const status = { ...this.currentStatus };
    this.subscribers.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('[NetworkMonitor] Error in subscriber callback:', error);
      }
    });
  }

  private getDefaultStatus(): NetworkStatus {
    return {
      isConnected: false,
      type: 'unknown',
      isInternetReachable: null,
      details: {
        isWifi: false,
        isCellular: false,
        isEthernet: false,
      },
    };
  }
}

// Singleton instance
export const networkMonitor = NetworkMonitor.getInstance();
