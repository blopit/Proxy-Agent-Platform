/**
 * Welcome Screen - First onboarding screen
 * Introduces the onboarding process and sets expectations
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS } from '@/src/types/onboarding';
import OpenMoji from '@/src/components/ui/OpenMoji';
import StepProgress from '@/src/components/onboarding/StepProgress';

export default function WelcomeScreen() {
  const router = useRouter();
  const { markStepComplete, nextStep, skipOnboarding } = useOnboarding();

  const handleGetStarted = async () => {
    await markStepComplete(ONBOARDING_STEPS.WELCOME);
    await nextStep();
    router.push('/(auth)/onboarding/work-preferences');
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)'); // Navigate to main app
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator */}
      <StepProgress currentStep={1} totalSteps={7} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Sparkles size={80} color={THEME.yellow} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to Proxy Agent!</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Let's personalize your experience for maximum productivity
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <OpenMoji emoji="🎯" size={32} color={THEME.base0} />
            <Text style={styles.benefitText}>Tailored to your work style</Text>
          </View>
          <View style={styles.benefitItem}>
            <OpenMoji emoji="🧠" size={32} color={THEME.base0} />
            <Text style={styles.benefitText}>ADHD-optimized features</Text>
          </View>
          <View style={styles.benefitItem}>
            <OpenMoji emoji="⚡" size={32} color={THEME.base0} />
            <Text style={styles.benefitText}>Smart task management</Text>
          </View>
          <View style={styles.benefitItem}>
            <OpenMoji emoji="📊" size={32} color={THEME.base0} />
            <Text style={styles.benefitText}>Visual productivity tracking</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            This will take about 2-3 minutes. You can skip and complete this later if you prefer.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <ArrowRight size={20} color={THEME.base03} style={styles.buttonIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Skip for now</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.yellow,
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
  benefitsList: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  benefitText: {
    fontSize: 16,
    color: THEME.base0,
    flex: 1,
  },
  infoBox: {
    backgroundColor: `${THEME.cyan}20`,
    borderLeftWidth: 4,
    borderLeftColor: THEME.cyan,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
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
  primaryButton: {
    backgroundColor: THEME.blue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: THEME.base3,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: THEME.base1,
    fontSize: 16,
    fontWeight: '500',
  },
});
