// app/(main)/community/_layout.tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';


/* ───── helper for safe top inset ───── */
const STATUS_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 24)
  : 0;

/* ───── create top‑tab navigator wrapped for expo‑router ───── */
const Tab = createMaterialTopTabNavigator();
const TopTabs = withLayoutContext(Tab.Navigator);

export default function CommunityTabs() {
    const colorScheme = useColorScheme();
  return (
    <TopTabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarIndicatorStyle: {
          backgroundColor: '#2E7D32',
          height: 3,
        },
        swipeEnabled: true,
        tabBarStyle: {
          paddingTop: STATUS_TOP,  // keeps bar below the status notch
          backgroundColor: '#FFF',
          elevation: 4,            // Android shadow
        },
      }}
     
    >
      {/* -> app/(main)/community/chat.tsx */}
     {/*  <TopTabs.Screen
        name="chat"
        options={{
          title: 'Chat', 
        }}
      /> */}

      {/* -> app/(main)/community/forums.tsx */}
      <TopTabs.Screen
        name="forum"
        options={{
          title: 'Forum',
        }}
      />
    </TopTabs>
  );
}
