import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSocketContext } from './SocketContext';

interface AuthUser {
  id: number;
  username: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authError: string;
  setAuthError: (msg: string) => void;
  authSuccess: string;
  setAuthSuccess: (msg: string) => void;
  handleAuth: (username: string, password: string) => Promise<void>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { backendUrl } = useSocketContext();
  const [token, setToken] = useState<string | null>(localStorage.getItem('monopoly_token'));
  const [user, setUser] = useState<AuthUser | null>(
    localStorage.getItem('monopoly_user') ? JSON.parse(localStorage.getItem('monopoly_user')!) : null
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleAuth = useCallback(async (username: string, password: string) => {
    setAuthError('');
    setAuthSuccess('');

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticacion');
      }

      if (authMode === 'login') {
        localStorage.setItem('monopoly_token', data.token);
        localStorage.setItem('monopoly_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setAuthSuccess('Registro completado! Ya puedes ingresar.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  }, [authMode, backendUrl]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('monopoly_token');
    localStorage.removeItem('monopoly_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, authMode, setAuthMode,
      authError, setAuthError, authSuccess, setAuthSuccess,
      handleAuth, handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
