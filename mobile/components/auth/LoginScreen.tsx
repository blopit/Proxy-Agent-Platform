/**
 * LoginScreen - Authentication login screen
 * Simple email/password login with Solarized Dark theme
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
} from 'react-native';
import { LogIn } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import SocialLoginButton, { SocialProvider } from './SocialLoginButton';

export interface LoginScreenProps {
  onLogin?: (email: string, password: string) => void;
  onSignupPress?: () => void;
  onSocialLogin?: (provider: SocialProvider) => void;
  isLoading?: boolean;
  error?: string;
  showSocialLogins?: boolean;
}

export default function LoginScreen({
  onLogin,
  onSignupPress,
  onSocialLogin,
  isLoading = false,
  error,
  showSocialLogins = true,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (onLogin && email && password) {
      onLogin(email, password);
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <LogIn size={64} color={THEME.cyan} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
            placeholder="••••••••"
            placeholderTextColor={THEME.base01}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading || !email || !password}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Social Login Section */}
        {showSocialLogins && (
          <>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or continue with</Text>
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

        {/* Signup Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onSignupPress} disabled={isLoading}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
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
    backgroundColor: THEME.cyan,
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
