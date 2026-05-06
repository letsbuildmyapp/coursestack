import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { demoStore, subscribe } from '@/lib/store';
import type { AppUser, Role } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signInWithGoogle: () => Promise<AppUser>;
  signUp: (email: string, password: string, displayName: string) => Promise<AppUser>;
  signOut: () => Promise<void>;
  hasRole: (r: Role) => boolean;
  switchDemoUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => demoStore.currentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribe(() => setUser(demoStore.currentUser()));
    return () => {
      unsub();
    };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    async signIn(email, password) {
      setLoading(true);
      try {
        const u = demoStore.signIn(email, password);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async signInWithGoogle() {
      setLoading(true);
      try {
        const u = demoStore.signInWithGoogle();
        return u;
      } finally {
        setLoading(false);
      }
    },
    async signUp(email, password, displayName) {
      setLoading(true);
      try {
        const u = demoStore.signUp(email, password, displayName);
        return u;
      } finally {
        setLoading(false);
      }
    },
    async signOut() {
      demoStore.signOut();
    },
    hasRole(r) {
      return !!user && user.roles.includes(r);
    },
    switchDemoUser(id) {
      const u = demoStore.listAllUsers().find((x) => x.id === id);
      if (u) {
        // bypass password by directly mutating store via signIn-equivalent
        (demoStore as unknown as { __setUser?: (id: string) => void }).__setUser?.(id);
        // fallback: update via updateProfile noop and direct call
        demoStore.signOut();
        try {
          demoStore.signIn(u.email, 'coursestack');
        } catch {
          // ignore — password may differ; nothing else to do in demo
        }
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
