import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, authLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (authLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      // Redirect to login if not authenticated and trying to access tabs
      router.replace('/login');
    } else if (user && !inTabsGroup) {
      // Redirect to tabs if authenticated and not in tabs (e.g., on login screen)
      router.replace('/(tabs)');
    }
  }, [user, authLoading, segments]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFCF8' }}>
        <ActivityIndicator size="large" color="#52796F" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
