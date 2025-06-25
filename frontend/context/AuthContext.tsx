import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Import Supabase client
// import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  // TODO: Update this interface to match Supabase user structure
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with Supabase auth state listener
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       setUser({
    //         id: session.user.id,
    //         email: session.user.email!,
    //         name: session.user.user_metadata?.name
    //       });
    //     } else {
    //       setUser(null);
    //     }
    //     setIsLoading(false);
    //   }
    // );
    
    // For now, just set loading to false
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with Supabase sign in
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      // 
      // if (error) {
      //   console.error('Sign in error:', error);
      //   return false;
      // }
      // 
      // return !!data.user;
      
      console.log('Sign in:', email, password);
      // TEMPORARY: Always return true for testing
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Test User',
      };
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // TODO: Replace with Supabase sign up
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: {
      //       name: name,
      //     }
      //   }
      // });
      // 
      // if (error) {
      //   console.error('Sign up error:', error);
      //   return false;
      // }
      // 
      // return !!data.user;
      
      console.log('Sign up:', email, password, name);
      // TEMPORARY: Always return true for testing
      const mockUser: User = {
        id: '1',
        email: email,
        name: name,
      };
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // TODO: Replace with Supabase sign out
      // const { error } = await supabase.auth.signOut();
      // if (error) {
      //   console.error('Sign out error:', error);
      // }
      
      console.log('Sign out');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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