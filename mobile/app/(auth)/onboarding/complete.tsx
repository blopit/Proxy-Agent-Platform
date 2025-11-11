/**
 * Onboarding Complete Screen - Celebration and transition to main app
 * Step 7 (final) of onboarding flow
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { CheckCircle, Rocket } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS } from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { completeOnboarding, markStepComplete } = useOnboarding();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mark this step as complete
    markStepComplete(ONBOARDING_STEPS.COMPLETE);

    // Start animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    // Complete onboarding and save data
    await completeOnboarding();

    // Navigate to main app (capture tab)
    router.replace('/(tabs)/capture');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator - Step 7 (Complete) */}
      <StepProgress currentStep={7} totalSteps={7} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <CheckCircle size={120} color={THEME.green} strokeWidth={2} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>Your Proxy Agent is ready to help you thrive</Text>
        </Animated.View>

        {/* Features Preview */}
        <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
          <Text style={styles.featuresTitle}>What's next?</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🧠</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Brain Dump Mode</Text>
                <Text style={styles.featureDescription}>
                  Quickly capture thoughts without organization anxiety
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🎯</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Focus Sessions</Text>
                <Text style={styles.featureDescription}>
                  Timed work sessions optimized for your energy
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🗺️</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Task Landscape</Text>
                <Text style={styles.featureDescription}>
                  Visual overview of your entire task world
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🤖</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>AI Task Breakdown</Text>
                <Text style={styles.featureDescription}>
                  Automatic decomposition of overwhelming tasks
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Personalization Note */}
        <Animated.View style={[styles.personalNote, { opacity: fadeAnim }]}>
          <Text style={styles.personalNoteText}>
            Based on your profile, we've customized the app to match your work style and support
            level. You can adjust these settings anytime in your profile.
          </Text>
        </Animated.View>
      </View>

      {/* Get Started Button */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Rocket size={24} color={THEME.base03} />
          <Text style={styles.getStartedButtonText}>Launch Proxy Agent</Text>
        </TouchableOpacity>
      </Animated.View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: THEME.green,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: THEME.base0,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 12,
  },
  featureEmoji: {
    fontSize: 32,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: THEME.base01,
    lineHeight: 18,
  },
  personalNote: {
    backgroundColor: `${THEME.blue}20`,
    borderLeftWidth: 4,
    borderLeftColor: THEME.blue,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  personalNoteText: {
    fontSize: 14,
    color: THEME.base1,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    paddingTop: 20,
  },
  getStartedButton: {
    backgroundColor: THEME.green,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    boxShadow: `0px 4px 8px ${THEME.green}4D`, // 4D = 30% opacity in hex
    elevation: 8, // Keep for Android
  },
  getStartedButtonText: {
    color: THEME.base03,
    fontSize: 18,
    fontWeight: '700',
  },
});
