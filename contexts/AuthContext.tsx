import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/database.types';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user.id);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.email);
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await loadUserProfile(currentSession.user.id);
          } else {
            setProfile(null);
          }
          
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await profileService.getProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Create profile if it doesn't exist
        const newProfile = await profileService.createProfile({
          userId,
          email: user?.email || '',
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      setIsLoading(true);
      return await authService.signInWithMagicLink(email);
    } catch (error) {
      console.error('Error signing in with magic link:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      const updatedProfile = await profileService.updateProfile(user.id, data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadUserProfile(user.id);
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated,
    signInWithMagicLink,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};