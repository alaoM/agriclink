// app/_layout.tsx
import toastConfig from '@/components/toast/toastConfig';
import { AuthProvider } from '@/contexts/AuthContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontScaleProvider>
          
          <AuthProvider>
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
            <Toast config={toastConfig} />
          </AuthProvider>
     
      </FontScaleProvider>
    </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
