import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(null);
  const [session] = useState<Session | null>(null);
  const [loading] = useState(false);

  const signInWithGoogle = async () => {
    return { error: new Error('Authentication not configured') };
  };

  const signOut = async () => {
    console.log('Sign out called');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
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
