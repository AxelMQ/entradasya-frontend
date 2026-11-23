import React, { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../api/auth.api';
import { AuthResponse, LoginRequest, RegisterRequest, User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'entradasya_token';
const USER_KEY = 'entradasya_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY) || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify session on load
  useEffect(() => {
    const verifySession = async () => {
      const currentToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } catch (err) {
        console.warn('Session verification failed or token expired:', err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const saveAuthSession = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    // Also store standard keys for compatibility
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const login = async (credentials: LoginRequest): Promise<User> => {
    const response = await authApi.login(credentials);
    saveAuthSession(response);
    return response.user;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    const response = await authApi.register(data);
    saveAuthSession(response);
    return response.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    role: user?.role || null,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
