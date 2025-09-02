import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileHeader } from '../../components/ProfileHeader';
import { WelcomeSection } from '../../components/WelcomeSection';
import { StatsCards } from '../../components/StatsCards';
import { QuickActions } from '../../components/QuickActions';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { profile, user } = useAuth();

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleImageUpdate = (type: 'profile' | 'banner') => {
    Alert.alert(
      'Update Image',
      `Would you like to update your ${type} image?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Settings',
          onPress: () => router.push('/(authenticated)/settings'),
        },
      ]
    );
  };

  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    
    let completeness = 0;
    const fields = [
      profile.name,
      profile.email,
      profile.bio,
      profile.country,
      profile.profileImage,
      profile.bannerImage,
    ];
    
    fields.forEach(field => {
      if (field) completeness += 1;
    });
    
    return Math.round((completeness / fields.length) * 100);
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
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
        
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-2">
            <Ionicons name="apps" size={16} color="white" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          onImageUpdate={handleImageUpdate}
        />

        {/* Welcome Section */}
        <View className="mt-6">
          <WelcomeSection
            userName={profile.name}
            lastLogin={new Date()}
          />
        </View>

        {/* Stats Cards */}
        <StatsCards
          accountStatus="active"
          profileCompleteness={calculateProfileCompleteness()}
          memberSince={new Date(profile.created_at)}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}