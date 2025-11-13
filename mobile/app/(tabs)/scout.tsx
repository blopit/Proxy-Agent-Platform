import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/theme/ThemeContext';

export default function ScoutScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.base03 }]}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>🔍</Text>
      <Text style={[styles.title, { color: colors.blue }]}>Scout Mode</Text>
      <Text style={[styles.subtitle, { color: colors.base1 }]}>
        Explore, filter, and discover tasks
      </Text>
      <Text style={[styles.description, { color: colors.base0 }]}>
        Decision paralysis relief: Smart recommendations and filters{'\n'}
        help you find what to work on next without analysis paralysis.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
