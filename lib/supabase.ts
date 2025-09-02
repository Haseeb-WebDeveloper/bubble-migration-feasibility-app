import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // We'll use expo-secure-store for session storage
    autoRefreshToken: true,
    persistSession: true,
  },
});

export const STORAGE_BUCKET = process.env.EXPO_PUBLIC_STORAGE_BUCKET || 'user-images';
export const MAX_IMAGE_SIZE_MB = parseInt(process.env.EXPO_PUBLIC_MAX_IMAGE_SIZE_MB || '5');
export const SUPPORTED_IMAGE_TYPES = (process.env.EXPO_PUBLIC_SUPPORTED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');