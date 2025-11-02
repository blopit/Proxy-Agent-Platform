import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AddScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Add</Text>
      <Text style={styles.description}>
        Quick-capture tasks, events, habits, and notes.{'\n'}
        Immediate capture without overthinking.
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2aa198', // Solarized cyan
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#839496', // Solarized base0
    textAlign: 'center',
    lineHeight: 24,
  },
});
