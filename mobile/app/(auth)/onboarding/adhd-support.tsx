/**
 * Support Level Screen - How much assistance do you want?
 * Step 4 of onboarding flow - Shows recommended support level based on challenges
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Sparkles, ArrowRight, ArrowLeft, Check, Star } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS, ADHDSupportLevel } from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';

const HELP_LEVELS = [
  {
    level: 3 as ADHDSupportLevel,
    title: 'Light Touch',
    emoji: '🌱',
    description: 'Minimal guidance - I mostly have it figured out',
    features: ['Basic task lists', 'Simple reminders', 'Clean interface'],
  },
  {
    level: 5 as ADHDSupportLevel,
    title: 'Balanced Support',
    emoji: '⚖️',
    description: 'Some structure and helpful nudges when needed',
    features: ['Smart suggestions', 'Focus timers', 'Progress tracking'],
  },
  {
    level: 7 as ADHDSupportLevel,
    title: 'Extra Help',
    emoji: '🎯',
    description: 'More structure, reminders, and task breakdown',
    features: ['Detailed guidance', 'Frequent check-ins', 'Task breakdown'],
  },
  {
    level: 10 as ADHDSupportLevel,
    title: 'Maximum Support',
    emoji: '🚀',
    description: 'Full assistance with staying on track and organized',
    features: ['Step-by-step guidance', 'Proactive reminders', 'Full task automation'],
  },
];

/**
 * Calculate recommended support level based on selected challenges
 * More challenges = higher support level recommended
 */
const getRecommendedLevel = (challengeCount: number): ADHDSupportLevel => {
  if (challengeCount === 0) return 5; // Balanced by default
  if (challengeCount <= 2) return 3; // Light Touch
  if (challengeCount <= 4) return 5; // Balanced Support
  if (challengeCount <= 6) return 7; // Extra Help
  return 10; // Maximum Support
};

export default function ADHDSupportScreen() {
  const router = useRouter();
  const { data, setADHDSupportLevel, markStepComplete, nextStep, skipOnboarding } =
    useOnboarding();

  const challenges = data.adhdChallenges || [];
  const recommendedLevel = getRecommendedLevel(challenges.length);

  const [selectedLevel, setSelectedLevel] = useState<ADHDSupportLevel>(
    (data.adhdSupportLevel as ADHDSupportLevel) || recommendedLevel
  );

  // Set recommended level on mount if no level is set
  useEffect(() => {
    if (!data.adhdSupportLevel) {
      setSelectedLevel(recommendedLevel);
    }
  }, [recommendedLevel, data.adhdSupportLevel]);

  const handleContinue = async () => {
    await setADHDSupportLevel(selectedLevel, challenges);
    await markStepComplete(ONBOARDING_STEPS.ADHD_SUPPORT);
    await nextStep();
    router.push('/(auth)/onboarding/daily-schedule');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)');
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
            <Sparkles size={32} color={THEME.cyan} />
            <Text style={styles.title}>How can we help?</Text>
          </View>
          <Text style={styles.subtitle}>
            {challenges.length > 0
              ? `Based on your ${challenges.length} selected ${challenges.length === 1 ? 'challenge' : 'challenges'}, we recommend a support level. You can adjust it below.`
              : 'Choose the amount of guidance that works for you'}
          </Text>
        </View>

        {/* Help Level Cards */}
        <View style={styles.levelsContainer}>
          {HELP_LEVELS.map((helpLevel) => {
            const isSelected = selectedLevel === helpLevel.level;
            const isRecommended = recommendedLevel === helpLevel.level;
            return (
              <TouchableOpacity
                key={helpLevel.level}
                style={[
                  styles.levelCard,
                  isSelected && styles.levelCardSelected,
                  isRecommended && !isSelected && styles.levelCardRecommended,
                ]}
                onPress={() => setSelectedLevel(helpLevel.level)}
                activeOpacity={0.7}
              >
                {/* Selection Indicator */}
                <View style={styles.levelCardHeader}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelEmoji}>{helpLevel.emoji}</Text>
                    <Text style={[styles.levelTitle, isSelected && styles.levelTitleSelected]}>
                      {helpLevel.title}
                    </Text>
                    {isRecommended && !isSelected && (
                      <View style={styles.recommendedBadge}>
                        <Star size={12} color={THEME.yellow} fill={THEME.yellow} />
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Check size={20} color={THEME.base03} />
                    </View>
                  )}
                </View>

                <Text style={styles.levelDescription}>{helpLevel.description}</Text>

                {/* Features List */}
                <View style={styles.featuresList}>
                  {helpLevel.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureBullet}>•</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
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
  levelsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  levelCard: {
    backgroundColor: THEME.base02,
    borderWidth: 2,
    borderColor: THEME.base02,
    borderRadius: 16,
    padding: 20,
  },
  levelCardSelected: {
    borderColor: THEME.cyan,
    backgroundColor: `${THEME.cyan}15`,
  },
  levelCardRecommended: {
    borderColor: THEME.yellow,
    backgroundColor: `${THEME.yellow}10`,
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${THEME.yellow}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.yellow,
  },
  levelEmoji: {
    fontSize: 28,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.base0,
  },
  levelTitleSelected: {
    color: THEME.cyan,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelDescription: {
    fontSize: 15,
    color: THEME.base01,
    lineHeight: 21,
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureBullet: {
    fontSize: 14,
    color: THEME.cyan,
    fontWeight: '700',
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    color: THEME.base0,
    flex: 1,
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
