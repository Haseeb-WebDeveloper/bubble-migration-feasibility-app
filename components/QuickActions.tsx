import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      icon: 'person-outline',
      color: 'bg-blue-50',
      iconColor: '#3B82F6',
      route: '/(authenticated)/settings',
    },
    {
      title: 'Upload Photos',
      description: 'Add profile and banner images',
      icon: 'camera-outline',
      color: 'bg-purple-50',
      iconColor: '#8B5CF6',
      route: '/(authenticated)/settings',
    },
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: 'settings-outline',
      color: 'bg-green-50',
      iconColor: '#10B981',
      route: '/(authenticated)/settings',
    },
  ];

  const handleActionPress = (route: string) => {
    router.push(route);
  };

  return (
    <View className="px-4">
      <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
      
      <View className="space-y-3">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-row items-center"
            onPress={() => handleActionPress(action.route)}
          >
            <View className={`w-12 h-12 ${action.color} rounded-xl items-center justify-center mr-4`}>
              <Ionicons name={action.icon as any} size={24} color={action.iconColor} />
            </View>
            
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base mb-1">
                {action.title}
              </Text>
              <Text className="text-gray-600 text-sm">
                {action.description}
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};