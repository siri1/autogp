'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { type AppUser, type ModuleId, SAMPLE_USERS, canAccess, isSuperAdmin } from '@/lib/auth';

interface AuthContextValue {
  user: AppUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  can: (module: ModuleId) => boolean;
  allUsers: AppUser[];
  setAllUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'autogp_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>(SAMPLE_USERS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AppUser;
        // Re-validate against current user list (role may have changed)
        const fresh = SAMPLE_USERS.find(u => u.id === saved.id);
        if (fresh) setUser(fresh);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const login = (email: string, password: string): boolean => {
const found = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return false;
    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const can = (module: ModuleId): boolean => {
    if (!user) return false;
    if (isSuperAdmin(user)) return module === 'tenants';
    return canAccess(user, module);
  };

  if (!hydrated) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, can, allUsers, setAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
