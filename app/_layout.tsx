// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(splash)" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />   {/* <- don’t comment this out */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
