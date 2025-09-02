import { supabase } from '../lib/supabase';
import { Profile, ProfileInsert, ProfileUpdate } from '../lib/database.types';

export interface ProfileService {
  getProfile(userId: string): Promise<Profile | null>;
  createProfile(data: Omit<ProfileInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile>;
  updateProfile(userId: string, data: Partial<ProfileUpdate>): Promise<Profile>;
  deleteProfile(userId: string): Promise<void>;
}

class ProfileServiceImpl implements ProfileService {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - profile doesn't exist
          return null;
        }
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getProfile:', error);
      throw error;
    }
  }

  async createProfile(data: Omit<ProfileInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          user_id: data.userId,
          email: data.email,
          name: data.name || null,
          country: data.country || null,
          bio: data.bio || null,
          avatar_url: data.avatarUrl || null,
          profile_image: data.profileImage || null,
          banner_image: data.bannerImage || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      return profile;
    } catch (error) {
      console.error('Unexpected error in createProfile:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: Partial<ProfileUpdate>): Promise<Profile> {
    try {
      const updateData: Record<string, any> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
      if (data.profileImage !== undefined) updateData.profile_image = data.profileImage;
      if (data.bannerImage !== undefined) updateData.banner_image = data.bannerImage;

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return profile;
    } catch (error) {
      console.error('Unexpected error in updateProfile:', error);
      throw error;
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Unexpected error in deleteProfile:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileServiceImpl();