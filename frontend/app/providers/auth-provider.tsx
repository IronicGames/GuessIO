'use client';

import { UserProfile } from '@shared/types/user.types';
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { api } from '@lib/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
      setToken(storedToken);

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
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          throw error;
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);

    try {
      const profileData = await api.auth.getUserProfile(newToken);

      setUser({
        id: profileData.id,
        name: profileData.name,
        profilePicture: profileData.profilePicture,
      });
    } catch (error) {
      console.error('❌ Login failed:', error);

      localStorage.removeItem('authToken');
      setToken(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('authToken');
    window.location.href = '/?success=logout';
  }, []);

  const isLoggedIn = !!user && !!token;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn, login, logout, loading }}
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
