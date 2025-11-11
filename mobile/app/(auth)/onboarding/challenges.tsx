/**
 * Challenges Screen - What do you need help with?
 * Step 3 of onboarding flow - User selects challenges before support level
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS } from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';

const COMMON_CHALLENGES = [
  { id: 'starting', label: 'Getting started on tasks', emoji: '🏁' },
  { id: 'focus', label: 'Staying focused', emoji: '🎯' },
  { id: 'time', label: 'Time awareness', emoji: '⏰' },
  { id: 'organization', label: 'Keeping things organized', emoji: '📋' },
  { id: 'procrastination', label: 'Beating procrastination', emoji: '⚡' },
  { id: 'overwhelm', label: 'Managing overwhelm', emoji: '🌊' },
  { id: 'transitions', label: 'Switching between tasks', emoji: '🔄' },
  { id: 'completion', label: 'Finishing what I start', emoji: '✅' },
];

export default function ChallengesScreen() {
  const router = useRouter();
  const { data, setChallenges, markStepComplete, nextStep, skipOnboarding } = useOnboarding();

  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(
    data.adhdChallenges || []
  );

  const handleContinue = async () => {
    await setChallenges(selectedChallenges);
    await markStepComplete(ONBOARDING_STEPS.CHALLENGES);
    await nextStep();
    router.push('/(auth)/onboarding/adhd-support');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)');
  };

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challengeId) ? prev.filter((c) => c !== challengeId) : [...prev, challengeId]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator */}
      <StepProgress currentStep={3} totalSteps={7} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Heart size={32} color={THEME.magenta} />
            <Text style={styles.title}>What do you need help with?</Text>
          </View>
          <Text style={styles.subtitle}>
            Tap on any that resonate with you. We'll personalize your experience based on your needs.
          </Text>
        </View>

        {/* Challenges List */}
        <View style={styles.challengesContainer}>
          <View style={styles.challengesList}>
            {COMMON_CHALLENGES.map((challenge) => {
              const isSelected = selectedChallenges.includes(challenge.id);
              return (
                <TouchableOpacity
                  key={challenge.id}
                  style={[styles.challengeChip, isSelected && styles.challengeChipSelected]}
                  onPress={() => toggleChallenge(challenge.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                  <Text
                    style={[styles.challengeText, isSelected && styles.challengeTextSelected]}
                  >
                    {challenge.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Optional hint */}
        {selectedChallenges.length === 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              💡 Select as many as you'd like, or skip if you prefer to explore on your own
            </Text>
          </View>
        )}

        {selectedChallenges.length > 0 && (
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryText}>
              {selectedChallenges.length} {selectedChallenges.length === 1 ? 'area' : 'areas'} selected
            </Text>
          </View>
        )}
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
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    lineHeight: 22,
  },
  challengesContainer: {
    marginBottom: 24,
  },
  challengesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  challengeChip: {
    backgroundColor: THEME.base02,
    borderWidth: 2,
    borderColor: THEME.base01,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeChipSelected: {
    backgroundColor: `${THEME.magenta}20`,
    borderColor: THEME.magenta,
  },
  challengeEmoji: {
    fontSize: 18,
  },
  challengeText: {
    fontSize: 14,
    color: THEME.base0,
    fontWeight: '500',
  },
  challengeTextSelected: {
    color: THEME.magenta,
    fontWeight: '600',
  },
  hintContainer: {
    backgroundColor: `${THEME.blue}15`,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  hintText: {
    fontSize: 14,
    color: THEME.base01,
    lineHeight: 20,
  },
  selectionSummary: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: `${THEME.magenta}20`,
    borderRadius: 20,
    alignSelf: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.magenta,
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
