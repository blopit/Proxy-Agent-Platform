/**
 * EmailSignupScreen - Email/password registration with password strength checker
 * Second screen in the signup flow
 */

import React, { useState, useMemo } from 'react';
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
import { Check, X } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';

export interface EmailSignupScreenProps {
  onSignup?: (name: string, email: string, password: string) => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Contains number', test: (pwd) => /[0-9]/.test(pwd) },
  { label: 'Contains special character', test: (pwd) => /[^A-Za-z0-9]/.test(pwd) },
];

export default function EmailSignupScreen({
  onSignup,
  onBack,
  isLoading = false,
  error,
}: EmailSignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Calculate password strength
  const passwordChecks = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      label: req.label,
      passed: req.test(password),
    }));
  }, [password]);

  const passwordStrength = useMemo(() => {
    const passedCount = passwordChecks.filter((c) => c.passed).length;
    if (passedCount === 0) return { label: '', color: THEME.base01, percent: 0 };
    if (passedCount <= 2) return { label: 'Weak', color: THEME.red, percent: 33 };
    if (passedCount <= 4) return { label: 'Medium', color: THEME.yellow, percent: 66 };
    return { label: 'Strong', color: THEME.green, percent: 100 };
  }, [passwordChecks]);

  const isPasswordValid = passwordChecks.every((c) => c.passed);

  const handleSignup = () => {
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }

    if (!isPasswordValid) {
      setLocalError('Password does not meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (onSignup && name && email && password) {
      onSignup(name, email, password);
    }
  };

  const displayError = error || localError;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} disabled={isLoading} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sign up with Email</Text>
          <Text style={styles.subtitle}>Create your account</Text>
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
            placeholder="Create a strong password"
            placeholderTextColor={THEME.base01}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
            onFocus={() => setShowPasswordRequirements(true)}
          />

          {/* Password Strength Bar */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${passwordStrength.percent}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              {passwordStrength.label && (
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              )}
            </View>
          )}

          {/* Password Requirements Checklist */}
          {showPasswordRequirements && password.length > 0 && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              {passwordChecks.map((check, index) => (
                <View key={index} style={styles.requirementRow}>
                  {check.passed ? (
                    <Check size={16} color={THEME.green} />
                  ) : (
                    <X size={16} color={THEME.base01} />
                  )}
                  <Text
                    style={[
                      styles.requirementText,
                      { color: check.passed ? THEME.green : THEME.base01 },
                    ]}
                  >
                    {check.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              confirmPassword && password !== confirmPassword && styles.inputError,
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor={THEME.base01}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
          {confirmPassword && password !== confirmPassword && (
            <Text style={styles.inputErrorText}>Passwords do not match</Text>
          )}
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (isLoading || !name || !email || !isPasswordValid || password !== confirmPassword) &&
              styles.buttonDisabled,
          ]}
          onPress={handleSignup}
          disabled={
            isLoading || !name || !email || !isPasswordValid || password !== confirmPassword
          }
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
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
  headerContainer: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    color: THEME.cyan,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
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
  inputError: {
    borderColor: THEME.red,
  },
  inputErrorText: {
    color: THEME.red,
    fontSize: 12,
    marginTop: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: THEME.base02,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 60,
  },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: THEME.base02,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
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
});
