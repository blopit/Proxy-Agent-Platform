import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ScoutScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>Scout Mode</Text>
      <Text style={styles.subtitle}>
        Explore, filter, and discover tasks
      </Text>
      <Text style={styles.description}>
        Decision paralysis relief: Smart recommendations and filters{'\n'}
        help you find what to work on next without analysis paralysis.
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
    color: '#268bd2', // Solarized blue
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
