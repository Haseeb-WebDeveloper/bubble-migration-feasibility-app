import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Profile } from '../lib/database.types';
import { getShadowStyle } from '../lib/styles';

interface ProfileHeaderProps {
  profile: Profile;
  onImageUpdate: (type: 'profile' | 'banner') => void;
  isLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onImageUpdate,
  isLoading = false,
}) => {
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderBannerContent = () => (
    <View className="h-32 relative">
      <TouchableOpacity
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
        onPress={() => onImageUpdate('banner')}
        disabled={isLoading}
      >
        <Ionicons name="camera" size={16} color="white" />
      </TouchableOpacity>
      
      {profile.bannerImage ? (
        <ImageBackground
          source={{ uri: profile.bannerImage }}
          className="flex-1 bg-gray-200"
          style={{ resizeMode: 'cover' }}
        />
      ) : (
        <View className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center">
          <Ionicons name="image-outline" size={32} color="white" opacity={0.6} />
        </View>
      )}
    </View>
  );

  return (
    <View className="bg-white" style={getShadowStyle('sm')}>
      {/* Banner Section */}
      {renderBannerContent()}
      
      {/* Profile Section */}
      <View className="px-6 pb-6">
        <View className="flex-row items-end -mt-8">
          {/* Profile Image */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => onImageUpdate('profile')}
              disabled={isLoading}
              className="relative"
            >
              {profile.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  className="w-24 h-24 rounded-full border-4 border-white"
                  style={{ resizeMode: 'cover' }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 items-center justify-center">
                  <Text className="text-gray-600 text-xl font-bold">
                    {getInitials(profile.name)}
                  </Text>
                </View>
              )}
              
              <View className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* User Info */}
          <View className="flex-1 ml-4 pb-2">
            <Text className="text-xl font-bold text-gray-900">
              {profile.name || 'Add your name'}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              {profile.email}
            </Text>
            {profile.country && (
              <Text className="text-gray-500 text-sm mt-1">
                📍 {profile.country}
              </Text>
            )}
          </View>
          
          {/* Edit Button */}
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold text-sm">Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bio Section */}
        {profile.bio && (
          <View className="mt-4">
            <Text className="text-gray-700 text-base leading-5">
              {profile.bio}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};