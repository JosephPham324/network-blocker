import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Settings, LayoutDashboard, ShieldBan, Trophy } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // App Theme Colors
  const tabColor = '#52796F';
  const tabInactiveColor = '#A0ABC0';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabColor,
        tabBarInactiveTintColor: tabInactiveColor,
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FDFCF8',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#EBE7DE',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#354F52',
          fontFamily: 'serif',
          fontSize: 22,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EBE7DE',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="blocklist"
        options={{
          title: 'Block Rules',
          tabBarIcon: ({ color }) => <ShieldBan size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gamification"
        options={{
          title: 'Focus & Stats',
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
