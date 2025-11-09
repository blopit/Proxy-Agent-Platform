/**
 * SignupScreen - Landing page for signup with social options
 * First screen in the signup flow
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Mail } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import SocialLoginButton, { SocialProvider } from './SocialLoginButton';

export interface SignupScreenProps {
  onEmailSignupPress?: () => void;
  onLoginPress?: () => void;
  onSocialLogin?: (provider: SocialProvider) => void;
  isLoading?: boolean;
  error?: string;
}

export default function SignupScreen({
  onEmailSignupPress,
  onLoginPress,
  onSocialLogin,
  isLoading = false,
  error,
}: SignupScreenProps) {
  const handleSocialLogin = (provider: SocialProvider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title Section */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Choose how you'd like to sign up</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Email Signup Button */}
        <TouchableOpacity
          style={[styles.emailButton, isLoading && styles.buttonDisabled]}
          onPress={onEmailSignupPress}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Mail size={20} color={THEME.base03} />
          <Text style={styles.emailButtonText}>Sign up with Email</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <SocialLoginButton
            provider="google"
            onPress={() => handleSocialLogin('google')}
            isLoading={isLoading}
          />
          <SocialLoginButton
            provider="apple"
            onPress={() => handleSocialLogin('apple')}
            isLoading={isLoading}
          />
          <SocialLoginButton
            provider="github"
            onPress={() => handleSocialLogin('github')}
            isLoading={isLoading}
          />
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={onLoginPress}>
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.base0,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: `${THEME.red}20`,
    borderLeftWidth: 4,
    borderLeftColor: THEME.red,
    padding: 12,
    marginBottom: 24,
    borderRadius: 4,
  },
  errorText: {
    color: THEME.red,
    fontSize: 14,
  },
  socialContainer: {
    gap: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.base01,
  },
  dividerText: {
    color: THEME.base01,
    fontSize: 14,
    marginHorizontal: 16,
  },
  emailButton: {
    backgroundColor: THEME.cyan,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emailButtonText: {
    color: THEME.base03,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  footerText: {
    color: THEME.base01,
    fontSize: 14,
  },
  link: {
    color: THEME.cyan,
    fontSize: 14,
    fontWeight: '600',
  },
});
