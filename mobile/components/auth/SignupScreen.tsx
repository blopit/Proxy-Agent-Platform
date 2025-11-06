/**
 * SignupScreen - New user registration screen
 * Email/password signup with Solarized Dark theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { UserPlus } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import SocialLoginButton, { SocialProvider } from './SocialLoginButton';

export interface SignupScreenProps {
  onSignup?: (name: string, email: string, password: string) => void;
  onLoginPress?: () => void;
  onSocialLogin?: (provider: SocialProvider) => void;
  isLoading?: boolean;
  error?: string;
  showSocialLogins?: boolean;
}

export default function SignupScreen({
  onSignup,
  onLoginPress,
  onSocialLogin,
  isLoading = false,
  error,
  showSocialLogins = true,
}: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSignup = () => {
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (onSignup && name && email && password) {
      onSignup(name, email, password);
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  const displayError = error || localError;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <UserPlus size={64} color={THEME.green} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to get started</Text>
        </View>

        {/* Error Message */}
        {displayError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        )}

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={THEME.base01}
            autoCapitalize="words"
            editable={!isLoading}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={THEME.base01}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor={THEME.base01}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor={THEME.base01}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading || !name || !email || !password || !confirmPassword}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Social Login Section */}
        {showSocialLogins && (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or sign up with</Text>
              <View style={styles.divider} />
            </View>

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
          </>
        )}

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={onLoginPress} disabled={isLoading}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    marginTop: 8,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.base02,
    borderWidth: 1,
    borderColor: THEME.base01,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: THEME.base0,
  },
  button: {
    backgroundColor: THEME.green,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: THEME.base01,
    opacity: 0.5,
  },
  buttonText: {
    color: THEME.base03,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.base01,
  },
  dividerText: {
    color: THEME.base01,
    fontSize: 13,
    marginHorizontal: 12,
  },
  socialContainer: {
    marginTop: 8,
  },
});
