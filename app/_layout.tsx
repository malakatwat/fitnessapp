import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '../context/AppContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SignUpProvider } from '../context/SignUpContext';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
};

// This component contains the "Auth Guard" logic
function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; 

    const inTabsGroup = segments[0] === '(tabs)';

    if (token && !inTabsGroup) {
      // User is logged in, redirect to app
      router.replace('/(tabs)');
    } else if (!token && inTabsGroup) {
      // User is logged out, redirect to login
      router.replace('/'); 
    }
  }, [token, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* --- THIS IS THE FIX --- */}
      <Stack.Screen name="(login)/index" />       {/* Changed from (login) to index */}
      <Stack.Screen name="(signup)" />   
      <Stack.Screen name="(tabs)" />     
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

// This is the main layout component that provides all the "brains"
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SignUpProvider>
        <AppProvider> 
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayoutNav /> 
            <StatusBar style="auto" />
          </ThemeProvider>
        </AppProvider>
      </SignUpProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  }
});