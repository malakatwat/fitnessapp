import * as SecureStore from 'expo-secure-store';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { API_URLS } from '../config'; // Make sure this path is correct

const TOKEN_KEY = 'my-jwt'; // The key to save the token under

interface User {
  id: number;
  name: string;
  email: string;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  age: number;
  current_weight: number;
  target_weight: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This provider will wrap your entire app
export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check for token

  useEffect(() => {
    // This runs when the app first loads
    // Try to load the token from secure storage
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error("Failed to load token", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    // This runs whenever the token changes (i.e., on login/logout)
    const fetchUser = async () => {
      if (token) {
        try {
          // Get the user's profile data using the token
          const response = await fetch(API_URLS.ME, { // We'll add this URL to config.ts
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }
          const data = await response.json();
          setUser(data.user);
        } catch (e) {
          console.error("Failed to fetch user data", e);
          // Token is invalid or expired, log out
          setAuthToken(null);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [token]);

  // Function to set the token and save/delete it from storage
  const setAuthToken = async (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  };

  const logout = () => {
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access auth state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};