import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme.ts';

export default function BusinessDashboardScreen() {
  const { colors } = useColorScheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Business Dashboard</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Aquí podrás ver estadísticas, productos y más funciones para negocios.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, textAlign: 'center' },
});
