import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Clear error function
  const clearError = () => setError(null);

  useEffect(() => {
    // Set up auth state listener for real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          if (session?.user) {
            // User is authenticated - update user state
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name
            });
            setError(null); // Clear any previous errors
          } else {
            // User is not authenticated - clear user state
            setUser(null);
          }
        } catch (err) {
          console.error('Error handling auth state change:', err);
          setError({
            message: 'Authentication state error. Please try again.',
            code: 'AUTH_STATE_ERROR'
          });
        } finally {
          // Set loading to false after initial auth check
          setIsLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting sign in for:', email);
      
      // Use real Supabase sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        
        // Handle specific error types
        let errorMessage = 'Sign in failed. Please try again.';
        let errorCode = 'SIGN_IN_ERROR';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password.';
          errorCode = 'INVALID_CREDENTIALS';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account.';
          errorCode = 'EMAIL_NOT_CONFIRMED';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please wait a moment.';
          errorCode = 'RATE_LIMITED';
        }
        
        setError({
          message: errorMessage,
          code: errorCode
        });
        return false;
      }
      
      console.log('Sign in successful for:', data.user?.email);
      return !!data.user;
      
    } catch (error) {
      console.error('Sign in error:', error);
      setError({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting sign up for:', email, 'with name:', name);
      
      // Use real Supabase sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error.message);
        
        // Handle specific error types
        let errorMessage = 'Sign up failed. Please try again.';
        let errorCode = 'SIGN_UP_ERROR';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists.';
          errorCode = 'USER_EXISTS';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters.';
          errorCode = 'WEAK_PASSWORD';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
          errorCode = 'INVALID_EMAIL';
        }
        
        setError({
          message: errorMessage,
          code: errorCode
        });
        return false;
      }
      
      console.log('Sign up successful for:', data.user?.email);
      return !!data.user;
      
    } catch (error) {
      console.error('Sign up error:', error);
      setError({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Attempting sign out');
      
      // Use real Supabase sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error.message);
        setError({
          message: 'Sign out failed. Please try again.',
          code: 'SIGN_OUT_ERROR'
        });
      } else {
        console.log('Sign out successful');
        setUser(null);
      }
      
    } catch (error) {
      console.error('Sign out error:', error);
      setError({
        message: 'Network error during sign out.',
        code: 'NETWORK_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error, 
      signIn, 
      signUp, 
      signOut, 
      clearError 
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