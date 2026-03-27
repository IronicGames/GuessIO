'use client';

import { type UserProfile } from '@shared/types/user.types';
import { createContext, useState, type ReactNode, useEffect, useContext, useCallback } from 'react';
import { api } from '@lib/api';
import StatusScreen from '@components/StatusScreen';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth
      .getUserProfile()
      .then((profileData) => {
        setUser({
          id: profileData.id,
          name: profileData.name,
          profilePicture: profileData.profilePicture,
        });
      })
      .catch((error) => {
        setUser(null);
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async () => {
    try {
      const profileData = await api.auth.getUserProfile();

      setUser({
        id: profileData.id,
        name: profileData.name,
        profilePicture: profileData.profilePicture,
      });
    } catch (error) {
      await api.auth.logout();
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isLoggedIn = !!user;

  if (loading) {
    return <StatusScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
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
