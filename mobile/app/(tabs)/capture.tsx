import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function CaptureScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.title}>Capture Mode</Text>
      <Text style={styles.subtitle}>
        Quick-capture tasks and thoughts as they come to you
      </Text>
      <Text style={styles.description}>
        For ADHD brains: Immediate task capture without overthinking.{'\n'}
        No categories, no planning—just capture and move on.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36', // Solarized base03
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2aa198', // Solarized cyan
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#93a1a1', // Solarized base1
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#839496', // Solarized base0
    textAlign: 'center',
    lineHeight: 20,
  },
});
