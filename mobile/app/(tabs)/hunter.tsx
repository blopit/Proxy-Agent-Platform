import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/theme/ThemeContext';

export default function HunterScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.base03 }]}>
      <StatusBar style="light" />
      <Text style={styles.emoji}>🎯</Text>
      <Text style={[styles.title, { color: colors.orange }]}>Hunter Mode</Text>
      <Text style={[styles.subtitle, { color: colors.base1 }]}>
        Execute tasks with laser focus
      </Text>
      <Text style={[styles.description, { color: colors.base0 }]}>
        Deep work interface: One task at a time, full screen.{'\n'}
        Timer, subtasks, and focus tools to achieve flow state.
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
