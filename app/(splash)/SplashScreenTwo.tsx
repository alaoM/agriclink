import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreenTwo() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login'); // Redirect to the login screen after the splash screen
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Col‑Agri — Splash 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
});
