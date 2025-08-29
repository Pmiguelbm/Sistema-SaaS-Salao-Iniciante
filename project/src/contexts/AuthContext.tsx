import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getBackend } from '../backend';

type Role = 'admin' | 'staff' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  ensureUserDoc: (role?: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider />');
  return ctx;
};

// With pluggable backend, profile is provided directly
async function loadProfile(): Promise<UserProfile | null> {
  const backend = getBackend();
  return backend.auth.getCurrentUser();
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backend = getBackend();
    const unsub = backend.auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const backend = getBackend();
    const profile = await backend.auth.signIn(email, password);
    setUser(profile);
    setLoading(false);
  };

  const logout = async () => {
    const backend = getBackend();
    await backend.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    setLoading(true);
    const profile = await loadProfile();
    setUser(profile);
    setLoading(false);
  };

  const ensureUserDoc = async (role: Role = 'user') => {
    const backend = getBackend();
    await backend.auth.ensureUserDoc(role);
    await refreshProfile();
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login,
    logout,
    refreshProfile,
    ensureUserDoc,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
