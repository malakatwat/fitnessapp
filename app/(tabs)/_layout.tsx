import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { AppProvider } from '../../context/AppContext';

const theme = {
  primary: '#00A878',
  lightText: '#777',
};

export default function AppLayout() {
  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.lightText,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.1,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="logFood"
          options={{
            title: 'Log Food',
            tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="aiCoach"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          }}
        />

        {/* --- ADD THESE NEW HIDDEN SCREENS --- */}
        <Tabs.Screen name="consultation" options={{ href: null, title: 'Consultation' }} />
        <Tabs.Screen name="challenges" options={{ href: null, title: 'Challenges' }} />
        <Tabs.Screen name="dietPlans" options={{ href: null, title: 'Diet Plans' }} />
        <Tabs.Screen name="recipes" options={{ href: null, title: 'Recipes' }} />
        <Tabs.Screen name="reports" options={{ href: null, title: 'Reports' }} />
         <Tabs.Screen
          name="addCustomFood"
          options={{
            href: null, // <--- This hides the "Add Custom" icon from the bottom bar
            title: 'Add Custom Food',
            headerShown: false,
          }}
        />
      </Tabs>
    </AppProvider>
  );
}

