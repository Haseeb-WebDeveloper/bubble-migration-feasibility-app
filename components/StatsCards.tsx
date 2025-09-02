import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardsProps {
  accountStatus: 'active' | 'pending' | 'inactive';
  profileCompleteness: number;
  memberSince: Date;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  accountStatus,
  profileCompleteness,
  memberSince,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-50', text: 'text-green-600', icon: 'checkmark-circle' };
      case 'pending':
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'time' };
      case 'inactive':
        return { bg: 'bg-red-50', text: 'text-red-600', icon: 'close-circle' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'help-circle' };
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'bg-green-50', text: 'text-green-600' };
    if (percentage >= 50) return { bg: 'bg-yellow-50', text: 'text-yellow-600' };
    return { bg: 'bg-red-50', text: 'text-red-600' };
  };

  const formatMemberSince = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColors = getStatusColor(accountStatus);
  const completenessColors = getCompletenessColor(profileCompleteness);

  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-4">Account Overview</Text>
      
      <View className="flex-row space-x-3">
        {/* Account Status Card */}
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <View className={`w-10 h-10 ${statusColors.bg} rounded-full items-center justify-center mb-3`}>
            <Ionicons name={statusColors.icon as any} size={20} color={statusColors.text.replace('text-', '#')} />
          </View>
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            Account Status
          </Text>
          <Text className={`${statusColors.text} text-sm font-semibold capitalize`}>
            {accountStatus}
          </Text>
        </View>

        {/* Profile Completeness Card */}
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <View className={`w-10 h-10 ${completenessColors.bg} rounded-full items-center justify-center mb-3`}>
            <Text className={`${completenessColors.text} text-xs font-bold`}>
              {profileCompleteness}%
            </Text>
          </View>
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            Profile Complete
          </Text>
          <Text className={`${completenessColors.text} text-sm font-semibold`}>
            {profileCompleteness}% Complete
          </Text>
        </View>

        {/* Member Since Card */}
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mb-3">
            <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          </View>
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            Member Since
          </Text>
          <Text className="text-blue-600 text-sm font-semibold">
            {formatMemberSince(memberSince)}
          </Text>
        </View>
      </View>
    </View>
  );
};