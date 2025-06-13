import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Splash1() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace('/SplashScreenTwo'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Col‑Agri — Splash 1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green' },
  title: { fontSize: 28, fontWeight: 'bold' },
});
