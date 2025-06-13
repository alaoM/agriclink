// app/(main)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

 import { HapticTab } from '@/components/HapticTab'; // optional – your haptic wrapper
import { IconSymbol } from '@/components/ui/IconSymbol'; // SF‑Symbol wrapper
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';
 
export default function MainTabs() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
         tabBarButton: HapticTab,
         tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' }, // allow the blur to show through
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"          // -> app/(main)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="weather"        // -> app/(main)/weather.tsx
        options={{
          title: 'Weather',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="weather-snowy-rainy" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"        // -> app/(main)/settings.tsx
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="ge" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
