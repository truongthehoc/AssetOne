import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export interface UserProfile {
  id: string;
  username: string;
  role: 'ADMIN' | 'IT_STAFF' | 'EXECUTIVE' | 'VIEWER';
  employeeId: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    department?: {
      id: string;
      code: string;
      name: string;
    };
    position?: {
      id: string;
      code: string;
      name: string;
    };
  } | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('assetone_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('assetone_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('assetone_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('assetone_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Session expired or error loading profile:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchMe();
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('assetone_token', newToken);
    localStorage.setItem('assetone_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('assetone_token');
    localStorage.removeItem('assetone_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem('assetone_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
