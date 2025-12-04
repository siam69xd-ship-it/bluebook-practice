import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  session: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  verifyEmailCode: (email: string, code: string, password: string, isSignUp: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    return { error: new Error('Google sign-in not implemented in this version') };
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Login failed') };
      }

      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Login failed') };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const codeResponse = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!codeResponse.ok) {
        const data = await codeResponse.json();
        return { error: new Error(data.message || 'Failed to send verification code') };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const verifyEmailCode = async (email: string, code: string, password: string, isSignUp: boolean) => {
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, password, isSignUp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Verification failed') };
      }

      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Verification failed') };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session: user,
      loading, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      verifyEmailCode,
      signOut 
    }}>
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
