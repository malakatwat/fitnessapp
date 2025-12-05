import { Stack } from 'expo-router';
import React from 'react';
import { SignUpProvider } from '../../context/SignUpContext';

// This is the navigator for the sign-up flow
export default function SignUpLayout() {
  return (
    // Ensure the context provider wraps the screens so they can share state
    <SignUpProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="goal" />
        <Stack.Screen name="details" />
        
        {/* If you have other screens like gender/activity, list them here */}
        <Stack.Screen name="gender" />
        <Stack.Screen name="activity" />
      </Stack>
    </SignUpProvider>
  );
}