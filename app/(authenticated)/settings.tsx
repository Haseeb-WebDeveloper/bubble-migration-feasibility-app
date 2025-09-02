import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileForm } from '../../components/ProfileForm';
import { ImageUploader } from '../../components/ImageUploader';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { profile, user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'images' | 'account'>('profile');

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleBackToDashboard = () => {
    router.push('/(authenticated)/dashboard');
  };

  const renderTabButton = (
    tab: 'profile' | 'images' | 'account',
    label: string,
    icon: string
  ) => (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg ${
        activeTab === tab ? 'bg-blue-600' : 'bg-gray-100'
      }`}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={activeTab === tab ? 'white' : '#6B7280'}
      />
      <Text
        className={`ml-2 font-medium ${
          activeTab === tab ? 'text-white' : 'text-gray-600'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderImagesTab = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="bg-white rounded-2xl p-6 mx-4 shadow-sm border border-gray-100 mb-4">
        <Text className="text-xl font-bold text-gray-900 mb-6">
          Profile Images
        </Text>

        {/* Profile Image Section */}
        <View className="mb-6">
          <Text className="text-gray-700 text-base font-medium mb-3">
            Profile Picture
          </Text>
          <View className="flex-row items-center">
            <ImageUploader
              currentImage={profile?.profileImage}
              aspectRatio="square"
              onUpload={async (imageUrl) => {
                try {
                  await updateProfile({ profileImage: imageUrl });
                  Alert.alert('Success', 'Profile picture updated successfully!');
                } catch (error) {
                  Alert.alert('Error', 'Failed to update profile picture.');
                }
              }}
              onDelete={async () => {
                try {
                  await updateProfile({ profileImage: null });
                  Alert.alert('Success', 'Profile picture removed successfully!');
                } catch (error) {
                  Alert.alert('Error', 'Failed to remove profile picture.');
                }
              }}
              placeholder="Upload Photo"
            />
            <View className="flex-1 ml-4">
              <Text className="text-gray-700 text-sm leading-5">
                Choose a profile picture that represents you. This will be visible to others.
              </Text>
              <Text className="text-gray-500 text-xs mt-2">
                JPG, PNG or WebP. Max 5MB. Square aspect ratio recommended.
              </Text>
            </View>
          </View>
        </View>

        {/* Banner Image Section */}
        <View className="mb-6">
          <Text className="text-gray-700 text-base font-medium mb-3">
            Banner Image
          </Text>
          <ImageUploader
            currentImage={profile?.bannerImage}
            aspectRatio="banner"
            onUpload={async (imageUrl) => {
              try {
                await updateProfile({ bannerImage: imageUrl });
                Alert.alert('Success', 'Banner image updated successfully!');
              } catch (error) {
                Alert.alert('Error', 'Failed to update banner image.');
              }
            }}
            onDelete={async () => {
              try {
                await updateProfile({ bannerImage: null });
                Alert.alert('Success', 'Banner image removed successfully!');
              } catch (error) {
                Alert.alert('Error', 'Failed to remove banner image.');
              }
            }}
            placeholder="Upload Banner"
          />
          <Text className="text-gray-500 text-xs mt-2">
            Banner image appears at the top of your profile. Recommended size: 1200x400px. Max 5MB.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAccountTab = () => (
    <View className="bg-white rounded-2xl p-6 mx-4 shadow-sm border border-gray-100">
      <Text className="text-xl font-bold text-gray-900 mb-6">
        Account Information
      </Text>

      <View className="space-y-4">
        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-gray-600">User ID</Text>
          <Text className="text-gray-900 font-mono text-sm">
            {user?.id.slice(0, 8)}...
          </Text>
        </View>

        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-gray-600">Email</Text>
          <Text className="text-gray-900">{user?.email}</Text>
        </View>

        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-gray-600">Member Since</Text>
          <Text className="text-gray-900">
            {profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        <View className="flex-row justify-between items-center py-3">
          <Text className="text-gray-600">Last Updated</Text>
          <Text className="text-gray-900">
            {profile ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={handleMenuPress}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="menu" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-900">Settings</Text>
        
        <TouchableOpacity
          onPress={handleBackToDashboard}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="p-4">
        <View className="flex-row space-x-2">
          {renderTabButton('profile', 'Profile', 'person-outline')}
          {renderTabButton('images', 'Images', 'camera-outline')}
          {renderTabButton('account', 'Account', 'settings-outline')}
        </View>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === 'profile' && (
          <ProfileForm
            initialData={profile}
            onSuccess={() => {
              Alert.alert('Success', 'Profile updated successfully!');
            }}
          />
        )}
        {activeTab === 'images' && renderImagesTab()}
        {activeTab === 'account' && renderAccountTab()}
      </View>
    </SafeAreaView>
  );
}