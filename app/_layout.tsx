// app/_layout.tsx
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <FontScaleProvider>          {/* provide the global font‑scale */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Splash Screen */}
        <Stack.Screen
          name="(splash)"
          options={{ presentation: 'fullScreenModal' }}
        />

        {/* Auth Screens */}
        <Stack.Screen name="(auth)" />

        {/* Main (protected) area */}
        <Stack.Screen name="(main)" />

        {/* Stand‑alone screens */}
        <Stack.Screen
          name="profile-edit"
          options={{ headerShown: true, title: 'Edit Profile' }}
        />
        <Stack.Screen name="guide/[id]" />

        {/* Fallback */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </FontScaleProvider>
  );
}
