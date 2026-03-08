'use client';

import { UserProfile } from '@shared/user.types';
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from 'react';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (
    token: string,
    userId: string,
    userName: string,
    userPicture: string
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    const storedUserPicture = localStorage.getItem('userPicture');

    if (storedToken && storedUserId && storedUserName) {
      setToken(storedToken);
      setUser({
        id: storedUserId,
        name: storedUserName,
        profilePicture: storedUserPicture || '',
      });
    }
  }, []);

  const login = (
    token: string,
    userId: string,
    userName: string,
    userPicture: string
  ) => {
    setToken(token);
    setUser({
      id: userId,
      name: userName,
      profilePicture: userPicture,
    });

    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userPicture', userPicture);
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
  };

  const isLoggedIn = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
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
