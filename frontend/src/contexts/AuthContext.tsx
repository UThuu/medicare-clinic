import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LoginRequest, LoginResponse } from '../types/auth';
import { authService, ApiError } from '../services/authService';

interface AuthContextType {
  user: LoginResponse | null;
  isInitializing: boolean;
  sessionError: string | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      setIsInitializing(true);
      setSessionError(null);
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          // HTTP 401: phiên không hợp lệ, không phải lỗi mạng/server
          setSessionError(null);
        } else {
          setSessionError(error.message);
        }
      } else if (error instanceof Error) {
        setSessionError(error.message);
      } else {
        setSessionError('Lỗi không xác định khi tải phiên đăng nhập.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (data: LoginRequest) => {
    const userData = await authService.login(data);
    setUser(userData);
    setSessionError(null);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isInitializing,
    sessionError,
    login,
    logout,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
