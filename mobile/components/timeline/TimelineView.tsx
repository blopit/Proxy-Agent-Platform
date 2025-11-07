/**
 * TimelineView - Chronological view of tasks and events
 *
 * Features:
 * - Hour-by-hour timeline layout
 * - Time blocks for scheduled tasks/events
 * - Current time indicator
 * - Drag-and-drop support (future)
 * - Multi-day view
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import { Text } from '@/src/components/ui/Text';

export interface TimelineEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  type: 'task' | 'event' | 'meeting' | 'break';
  color?: string;
  description?: string;
}

export interface TimelineViewProps {
  date?: Date;
  events: TimelineEvent[];
  startHour?: number; // Default: 0 (midnight)
  endHour?: number; // Default: 24
  hourHeight?: number; // Height of each hour block in pixels
  showCurrentTime?: boolean;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  date = new Date(),
  events,
  startHour = 6, // Default: 6am
  endHour = 22, // Default: 10pm
  hourHeight = 80,
  showCurrentTime = true,
}) => {
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeOffset = (currentHour - startHour) * hourHeight + (currentMinute / 60) * hourHeight;

  // Check if showing today
  const isToday = date.toDateString() === now.toDateString();

  // Generate hour labels
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );

  // Format time
  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Convert HH:MM to offset
  const timeToOffset = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number);
    return (hour - startHour) * hourHeight + (minute / 60) * hourHeight;
  };

  // Calculate event height
  const calculateEventHeight = (event: TimelineEvent): number => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return (durationMinutes / 60) * hourHeight;
  };

  // Get event color
  const getEventColor = (event: TimelineEvent): string => {
    if (event.color) return event.color;
    switch (event.type) {
      case 'task':
        return THEME.cyan;
      case 'event':
        return THEME.blue;
      case 'meeting':
        return THEME.violet;
      case 'break':
        return THEME.green;
      default:
        return THEME.cyan;
    }
  };

  return (
    <View style={styles.container}>
      {/* Date Header */}
      <View style={styles.header}>
        <Calendar size={20} color={THEME.base1} />
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>Today</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.timeline}>
          {/* Hour grid */}
          {hours.map((hour, index) => (
            <View key={hour} style={[styles.hourRow, { height: hourHeight }]}>
              {/* Time label */}
              <View style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>{formatTime(hour)}</Text>
              </View>

              {/* Hour line */}
              <View style={styles.hourLine} />
            </View>
          ))}

          {/* Current time indicator */}
          {showCurrentTime && isToday && currentHour >= startHour && currentHour < endHour && (
            <View style={[styles.currentTimeIndicator, { top: currentTimeOffset }]}>
              <View style={styles.currentTimeDot} />
              <View style={styles.currentTimeLine} />
              <Text style={styles.currentTimeText}>
                {now.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {/* Events */}
          <View style={styles.eventsContainer}>
            {events.map((event) => {
              const topOffset = timeToOffset(event.startTime);
              const height = calculateEventHeight(event);
              const color = getEventColor(event);

              return (
                <View
                  key={event.id}
                  style={[
                    styles.event,
                    {
                      top: topOffset,
                      height: height,
                      backgroundColor: color + '20',
                      borderLeftColor: color,
                    },
                  ]}
                >
                  <Text style={[styles.eventTime, { color }]}>
                    {event.startTime} - {event.endTime}
                  </Text>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  {event.description && height > 60 && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.base02,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base1,
  },
  todayBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: THEME.cyan + '20',
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.cyan,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 70,
    paddingRight: 16,
  },
  hourRow: {
    position: 'relative',
  },
  timeLabel: {
    position: 'absolute',
    left: -70,
    top: -8,
    width: 60,
  },
  timeLabelText: {
    fontSize: 12,
    color: THEME.base01,
    textAlign: 'right',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: THEME.base02,
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.red,
    marginLeft: -6,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: THEME.red,
  },
  currentTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.red,
    marginLeft: 8,
    backgroundColor: THEME.base03,
    paddingHorizontal: 4,
  },
  eventsContainer: {
    position: 'absolute',
    left: 70,
    right: 16,
    top: 0,
    bottom: 0,
  },
  event: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 8,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base1,
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 12,
    color: THEME.base0,
    lineHeight: 16,
  },
});

export default TimelineView;
