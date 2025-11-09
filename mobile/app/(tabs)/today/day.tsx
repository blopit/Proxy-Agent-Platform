import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function TodayScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>📅</Text>
      <Text style={styles.title}>Today Mode</Text>
      <Text style={styles.subtitle}>
        Focus on what matters right now
      </Text>
      <Text style={styles.description}>
        Hyper-focus optimization: See only today's tasks.{'\n'}
        Minimizes overwhelm by hiding everything else.
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
    color: '#b58900', // Solarized yellow
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
