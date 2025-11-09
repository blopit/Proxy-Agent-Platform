/**
 * Landing Screen - Welcome screen for new and returning users
 * First screen users see when not authenticated
 */

import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/src/components/ui/Text';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Logo/Brand Section */}
      <View style={styles.header}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.appName}>Proxy Agent</Text>
        <Text style={styles.tagline}>ADHD-Optimized Task Management</Text>
      </View>

      {/* Feature Highlights */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureEmoji}>🧠</Text>
          <Text style={styles.featureText}>Brain-dump capture</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureEmoji}>🎯</Text>
          <Text style={styles.featureText}>Focus mode with timers</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureEmoji}>🤖</Text>
          <Text style={styles.featureText}>AI task breakdown</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureEmoji}>📊</Text>
          <Text style={styles.featureText}>Visual task landscape</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>I have an account</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Built for ADHD minds • 5 biological productivity modes
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36', // Solarized Dark base03
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#b58900', // Solarized yellow
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#93a1a1', // Solarized base1
    textAlign: 'center',
  },
  features: {
    gap: 16,
    paddingHorizontal: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    fontSize: 16,
    color: '#839496', // Solarized base0
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#268bd2', // Solarized blue
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fdf6e3', // Solarized base3
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#586e75', // Solarized base01
  },
  secondaryButtonText: {
    color: '#93a1a1', // Solarized base1
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    fontSize: 12,
    color: '#586e75', // Solarized base01
    textAlign: 'center',
    marginBottom: 20,
  },
});
