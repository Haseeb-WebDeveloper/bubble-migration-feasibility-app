import React from 'react';
import { View, Text } from 'react-native';

interface WelcomeSectionProps {
  userName?: string | null;
  lastLogin?: Date;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  lastLogin,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View className="bg-white mx-4 rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        {getGreeting()}{userName ? `, ${userName}!` : '!'}
      </Text>
      <Text className="text-gray-600 text-base">
        Welcome back to your profile dashboard.
      </Text>
      {lastLogin && (
        <Text className="text-gray-500 text-sm mt-2">
          Last login: {formatDate(lastLogin)}
        </Text>
      )}
    </View>
  );
};