import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Activity</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});