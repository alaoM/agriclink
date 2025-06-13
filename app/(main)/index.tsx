// app/(main)/index.tsx
import { router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Col‑Agri Home</Text>

      {/* Show the current route */}
      <Text style={styles.subtitle}>Current route: {pathname}</Text>

      {/* Nav buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(main)/settings')}
      >
        <Text style={styles.buttonText}>Go Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(main)/weather')}
      >
        <Text style={styles.buttonText}>Go weather</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
 gap: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  button: {
    minWidth: 200,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#006400',
    alignItems: 'center',
  },
  logout: {
    backgroundColor: '#B22222',
    marginTop: 32,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
