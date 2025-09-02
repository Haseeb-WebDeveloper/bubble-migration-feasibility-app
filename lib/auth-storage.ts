import * as SecureStore from 'expo-secure-store';
import { Database } from './database.types';

// Custom storage adapter for Supabase Auth using Expo SecureStore
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  },
};

// Session storage keys
export const SESSION_KEYS = {
  ACCESS_TOKEN: 'supabase.auth.token',
  REFRESH_TOKEN: 'supabase.auth.refresh_token',
  USER: 'supabase.auth.user',
} as const;