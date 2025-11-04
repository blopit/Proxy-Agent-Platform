import { View, Text, StyleSheet } from 'react-native';

export default function ClarifyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Clarify Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#002b36',
  },
  text: {
    color: '#93a1a1',
    fontSize: 18,
  },
});
