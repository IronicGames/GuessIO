'use client';

import { type UserProfile } from '@shared/types/user.types';
import { createContext, useState, type ReactNode, useEffect, useContext, useCallback } from 'react';
import { api } from '@lib/api';
import LoadingOverlay from '@components/LoadingOverlay';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  loginWithGoogle: () => void;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const profileData = await api.auth.getUserProfile();
    setUser({
      id: profileData.id,
      name: profileData.name,
      profilePicture: profileData.profilePicture,
      role: profileData.role,
      isGuest: profileData.isGuest,
    });
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = `http://localhost:8080/api/auth/google`;
  }, []);

  const loginAsGuest = useCallback(
    async (name?: string) => {
      await api.auth.loginAsGuest(name);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
  }, []);

  if (loading) {
    return <LoadingOverlay mode="screen" status="loading" />;
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, loginWithGoogle, loginAsGuest, logout, loading }}
    >
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
