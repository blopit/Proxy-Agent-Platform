/**
 * Mock entry point for expo-router when running Storybook
 * This prevents expo-router from trying to initialize when STORYBOOK_ENABLED=true
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Return a simple placeholder component
export default function StorybookEntry() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Storybook Mode Active</Text>
      <Text style={styles.subtext}>
        Navigate to /storybook route to view Storybook UI
      </Text>
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
    fontSize: 24,
    color: '#268bd2',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#839496',
  },
});
