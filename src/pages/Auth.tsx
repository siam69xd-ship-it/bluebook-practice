import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      }
    } else {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Account created successfully! You can now sign in.');
        setMode('signin');
      }
    }
    setIsLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setMessage('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-primary-foreground">NP</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'signin' 
                ? 'Sign in to track your progress' 
                : 'Sign up to save your progress'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-600">
              {message}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium gap-3 mb-4"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                minLength={6}
                required
              />
            </div>
            
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-medium gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue as guest</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/quiz')}
            className="w-full h-12 text-base"
          >
            Practice without signing in
          </Button>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={switchMode}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={switchMode}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
