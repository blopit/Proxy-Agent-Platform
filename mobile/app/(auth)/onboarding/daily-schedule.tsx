/**
 * Daily Schedule Screen - Collect user's work schedule and availability
 * Step 4 of onboarding flow
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import {
  ONBOARDING_STEPS,
  TimePreference,
  DEFAULT_DAILY_SCHEDULE,
  WeeklyAvailability,
} from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';

const TIME_PREFERENCES: { value: TimePreference; label: string; emoji: string }[] = [
  { value: 'early_morning', label: 'Early Morning', emoji: '🌅' },
  { value: 'morning', label: 'Morning', emoji: '☀️' },
  { value: 'afternoon', label: 'Afternoon', emoji: '🌤️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
  { value: 'night', label: 'Night', emoji: '🌙' },
  { value: 'flexible', label: 'Flexible', emoji: '🔄' },
];

const DAYS_OF_WEEK: { key: keyof WeeklyAvailability; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'M' },
  { key: 'tuesday', label: 'Tuesday', short: 'T' },
  { key: 'wednesday', label: 'Wednesday', short: 'W' },
  { key: 'thursday', label: 'Thursday', short: 'T' },
  { key: 'friday', label: 'Friday', short: 'F' },
  { key: 'saturday', label: 'Saturday', short: 'S' },
  { key: 'sunday', label: 'Sunday', short: 'S' },
];

export default function DailyScheduleScreen() {
  const router = useRouter();
  const { data, setDailySchedule, markStepComplete, nextStep, skipOnboarding } = useOnboarding();

  const [schedule, setSchedule] = useState(data.dailySchedule || DEFAULT_DAILY_SCHEDULE);
  const [timePreference, setTimePreference] = useState<TimePreference>(
    data.dailySchedule?.timePreference || 'morning'
  );
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(
    data.dailySchedule?.weeklyAvailability || DEFAULT_DAILY_SCHEDULE.weeklyAvailability
  );
  const [flexibleSchedule, setFlexibleSchedule] = useState(
    data.dailySchedule?.flexibleSchedule || false
  );

  const handleContinue = async () => {
    const scheduleData = {
      preferredStartTime: schedule.preferredStartTime,
      preferredEndTime: schedule.preferredEndTime,
      timePreference,
      weeklyAvailability,
      flexibleSchedule,
    };

    await setDailySchedule(scheduleData);
    await markStepComplete(ONBOARDING_STEPS.DAILY_SCHEDULE);
    await nextStep();
    router.push('/(auth)/onboarding/goals');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)');
  };

  const toggleDay = (day: keyof WeeklyAvailability) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator */}
      <StepProgress currentStep={4} totalSteps={7} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Calendar size={32} color={THEME.cyan} />
            <Text style={styles.title}>Daily Schedule</Text>
          </View>
          <Text style={styles.subtitle}>
            When do you typically work or want to be productive?
          </Text>
        </View>

        {/* Time Preference */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={THEME.base0} />
            <Text style={styles.sectionTitle}>Preferred time of day</Text>
          </View>

          <View style={styles.timePreferences}>
            {TIME_PREFERENCES.map((pref) => {
              const isSelected = timePreference === pref.value;
              return (
                <TouchableOpacity
                  key={pref.value}
                  style={[styles.timePrefChip, isSelected && styles.timePrefChipSelected]}
                  onPress={() => setTimePreference(pref.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timePrefEmoji}>{pref.emoji}</Text>
                  <Text style={[styles.timePrefText, isSelected && styles.timePrefTextSelected]}>
                    {pref.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Weekly Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available days</Text>

          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = weeklyAvailability[day.key];
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  onPress={() => toggleDay(day.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
                    {day.short}
                  </Text>
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                    {day.label.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Flexible Schedule Toggle */}
        <View style={styles.section}>
          <View style={styles.flexibleToggleContainer}>
            <View style={styles.flexibleToggleText}>
              <Text style={styles.flexibleToggleLabel}>My schedule varies</Text>
              <Text style={styles.flexibleToggleDescription}>
                Enable if your schedule changes frequently
              </Text>
            </View>
            <Switch
              value={flexibleSchedule}
              onValueChange={setFlexibleSchedule}
              trackColor={{ false: THEME.base02, true: `${THEME.cyan}80` }}
              thumbColor={flexibleSchedule ? THEME.cyan : THEME.base01}
              ios_backgroundColor={THEME.base02}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            We'll use this to suggest optimal times for focus sessions and task scheduling
          </Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={20} color={THEME.base1} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color={THEME.base03} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 8,
  },
  header: {
    marginTop: 24,
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base0,
  },
  timePreferences: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timePrefChip: {
    backgroundColor: THEME.base02,
    borderWidth: 1,
    borderColor: THEME.base01,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timePrefChipSelected: {
    backgroundColor: `${THEME.cyan}30`,
    borderColor: THEME.cyan,
  },
  timePrefEmoji: {
    fontSize: 18,
  },
  timePrefText: {
    fontSize: 14,
    color: THEME.base0,
  },
  timePrefTextSelected: {
    color: THEME.cyan,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    backgroundColor: THEME.base02,
    borderWidth: 1,
    borderColor: THEME.base01,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: `${THEME.cyan}30`,
    borderColor: THEME.cyan,
  },
  dayShort: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 2,
  },
  dayShortSelected: {
    color: THEME.cyan,
  },
  dayLabel: {
    fontSize: 10,
    color: THEME.base01,
  },
  dayLabelSelected: {
    color: THEME.cyan,
  },
  flexibleToggleContainer: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexibleToggleText: {
    flex: 1,
  },
  flexibleToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 4,
  },
  flexibleToggleDescription: {
    fontSize: 13,
    color: THEME.base01,
  },
  infoBox: {
    backgroundColor: `${THEME.cyan}20`,
    borderLeftWidth: 4,
    borderLeftColor: THEME.cyan,
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: THEME.base1,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    paddingTop: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.base01,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: THEME.base1,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    flex: 2,
    backgroundColor: THEME.blue,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: THEME.base3,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: THEME.base01,
    fontSize: 14,
    fontWeight: '500',
  },
});
