import { Stack } from 'expo-router';

export default function SplashNavigation() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
