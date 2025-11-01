import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function HunterScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>🎯</Text>
      <Text style={styles.title}>Hunter Mode</Text>
      <Text style={styles.subtitle}>
        Execute tasks with laser focus
      </Text>
      <Text style={styles.description}>
        Deep work interface: One task at a time, full screen.{'\n'}
        Timer, subtasks, and focus tools to achieve flow state.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
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
    color: '#cb4b16', // Solarized orange
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#93a1a1',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#839496',
    textAlign: 'center',
    lineHeight: 20,
  },
});
