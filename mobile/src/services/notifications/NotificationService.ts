/**
 * NotificationService - Push and local notification management
 *
 * Features:
 * - Push notification registration
 * - Local notification scheduling
 * - Notification permission handling
 * - Badge count management
 * - Deep linking support
 *
 * Usage:
 *   const service = NotificationService.getInstance();
 *   await service.initialize();
 *   await service.scheduleLocal('Task reminder', 'Complete your task', 60);
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { StorageManager } from '../storage/StorageManager';

export interface NotificationData {
  type: 'task_reminder' | 'focus_break' | 'daily_summary' | 'achievement';
  taskId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: NotificationData;
  trigger: Date | number; // Date or seconds from now
}

export class NotificationService {
  private static instance: NotificationService;
  private storage: StorageManager;
  private pushToken: string | null = null;
  private isInitialized = false;

  private constructor() {
    this.storage = new StorageManager('notifications');
    this.configureNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('[NotificationService] Notification permissions denied');
        return;
      }

      // Register for push notifications
      if (Device.isDevice) {
        this.pushToken = await this.registerForPushNotifications();
        if (this.pushToken) {
          await this.storage.set('push_token', this.pushToken);
          console.log('[NotificationService] Push token:', this.pushToken);
        }
      } else {
        console.log('[NotificationService] Not a physical device, skipping push registration');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[NotificationService] Initialization error:', error);
    }
  }

  /**
   * Get push notification token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Schedule local notification
   */
  async scheduleLocal(
    title: string,
    body: string,
    trigger: Date | number,
    data?: NotificationData
  ): Promise<string> {
    const triggerDate =
      typeof trigger === 'number'
        ? new Date(Date.now() + trigger * 1000)
        : trigger;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: triggerDate,
    });

    // Save notification info
    const scheduled: ScheduledNotification = {
      id: notificationId,
      title,
      body,
      data,
      trigger,
    };
    await this.saveScheduledNotification(scheduled);

    return notificationId;
  }

  /**
   * Schedule task reminder
   */
  async scheduleTaskReminder(
    taskId: string,
    taskTitle: string,
    triggerTime: Date
  ): Promise<string> {
    return this.scheduleLocal(
      'Task Reminder',
      `Time to work on: ${taskTitle}`,
      triggerTime,
      { type: 'task_reminder', taskId }
    );
  }

  /**
   * Schedule focus break reminder
   */
  async scheduleFocusBreak(sessionId: string, breakMinutes: number): Promise<string> {
    return this.scheduleLocal(
      'Break Time!',
      `Take a ${breakMinutes}-minute break`,
      breakMinutes * 60,
      { type: 'focus_break', sessionId }
    );
  }

  /**
   * Schedule daily summary notification
   */
  async scheduleDailySummary(hour: number = 20): Promise<string> {
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hour, 0, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (triggerDate < now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    return this.scheduleLocal(
      'Daily Summary',
      'Review your progress for today',
      triggerDate,
      { type: 'daily_summary' }
    );
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    await this.removeScheduledNotification(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await this.storage.remove('scheduled_notifications');
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduled(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Set badge count (iOS)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Add notification received listener
   */
  addReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Check notification permissions status
   */
  async getPermissionsStatus(): Promise<Notifications.NotificationPermissionsStatus> {
    return Notifications.getPermissionsAsync();
  }

  private async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  private async registerForPushNotifications(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Replace with actual project ID
      });
      return token.data;
    } catch (error) {
      console.error('[NotificationService] Error getting push token:', error);
      return null;
    }
  }

  private configureNotifications(): void {
    // Set default notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2aa198', // Solarized cyan
      });

      // Task reminders channel
      Notifications.setNotificationChannelAsync('task_reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#268bd2', // Solarized blue
      });

      // Focus session channel
      Notifications.setNotificationChannelAsync('focus_sessions', {
        name: 'Focus Sessions',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100],
        lightColor: '#cb4b16', // Solarized orange
      });
    }
  }

  private async saveScheduledNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    const scheduled =
      (await this.storage.get<ScheduledNotification[]>('scheduled_notifications')) || [];
    scheduled.push(notification);
    await this.storage.set('scheduled_notifications', scheduled);
  }

  private async removeScheduledNotification(notificationId: string): Promise<void> {
    const scheduled =
      (await this.storage.get<ScheduledNotification[]>('scheduled_notifications')) || [];
    const filtered = scheduled.filter(n => n.id !== notificationId);
    await this.storage.set('scheduled_notifications', filtered);
  }
}

// Singleton instance
export const notificationService = NotificationService.getInstance();
