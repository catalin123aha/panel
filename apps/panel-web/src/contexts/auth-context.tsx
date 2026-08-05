'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sdk } from '@/lib/auth';

interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  isAdmin: boolean;
  maxBots: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (code: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing tokens in localStorage
    const storedAccessToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      fetchCurrentUser(storedAccessToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      sdk.setAccessToken(token);
      const userData = await sdk.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setAccessToken(null);
      setRefreshToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (code: string, state: string) => {
    try {
      const response = await sdk.exchangeCodeForTokens(code, state);
      
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await sdk.logout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const refresh = async () => {
    if (!refreshToken) return;

    try {
      const response = await sdk.refreshTokens(refreshToken);
      
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
