import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function MapperScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Mapper Mode</Text>
      <Text style={styles.subtitle}>
        Visualize your task landscape
      </Text>
      <Text style={styles.description}>
        Big-picture thinking: See task connections, dependencies,{'\n'}
        and progress zones. Perfect for weekly planning sessions.
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
    color: '#6c71c4', // Solarized violet
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
