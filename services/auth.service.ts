import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

export interface AuthService {
  signInWithMagicLink(email: string): Promise<{ error: Error | null }>;
  signOut(): Promise<void>;
  handleAuthCallback(url: string): Promise<void>;
}

class AuthServiceImpl implements AuthService {
  async signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
    try {
      // Create the redirect URL based on environment
      let redirectTo: string;
      
      if (__DEV__) {
        // For development, use the Expo development URL
        const devUrl = Constants.expoConfig?.hostUri;
        if (devUrl) {
          redirectTo = `exp://${devUrl}/--/auth/callback`;
        } else {
          // Fallback to custom scheme
          redirectTo = Linking.createURL('/auth/callback');
        }
      } else {
        // For production, use custom scheme
        redirectTo = Linking.createURL('/auth/callback');
      }
      
      console.log('Magic link redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "bubble-fesibility://auth/callback",
        },
      });

      if (error) {
        console.error('Magic link error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error in signInWithMagicLink:', error);
      return { error: error as Error };
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Unexpected error in signOut:', error);
      throw error;
    }
  }

  async handleAuthCallback(url: string): Promise<void> {
    try {
      console.log('Received auth callback URL:', url);
      
      // Handle both hash-based and query-based URLs
      let params: URLSearchParams;
      
      if (url.includes('#')) {
        // Hash-based URL (from Supabase)
        const hash = new URL(url).hash;
        params = new URLSearchParams(hash.replace('#', ''));
      } else if (url.includes('?')) {
        // Query-based URL (from deep linking)
        const urlObj = new URL(url);
        params = urlObj.searchParams;
      } else {
        // Try to parse as full URL
        const urlObj = new URL(url);
        params = new URLSearchParams(urlObj.search);
      }
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      console.log('Access token:', !!accessToken, 'Refresh token:', !!refreshToken);
      
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('Error setting session:', error);
          throw error;
        }
      } else {
        console.warn('No tokens found in URL');
        // Try to get session from Supabase directly
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        if (session) {
          console.log('Session already exists');
        }
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      throw error;
    }
  }
}

export const authService = new AuthServiceImpl();