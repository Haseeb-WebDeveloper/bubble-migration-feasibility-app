import { Ionicons } from '@expo/vector-icons';
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
} from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const drawerItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'home-outline',
    route: '/(authenticated)/dashboard',
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: 'settings-outline',
    route: '/(authenticated)/settings',
  },
];

export const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleNavigation = (route: string) => {
    router.push(route);
    props.navigation.closeDrawer();
  };

  const isActiveRoute = (route: string) => pathname === route;

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 py-6 border-b border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-lg font-bold">B</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">Bubble App</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="mr-3">
              {profile?.profileImage ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  className="w-10 h-10 rounded-full"
                  style={{ resizeMode: 'cover' }}
                />
              ) : (
                <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center">
                  <Text className="text-gray-600 font-semibold">
                    {getInitials(profile?.name)}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">
                {profile?.name || 'User'}
              </Text>
              <Text className="text-gray-500 text-sm">{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Navigation Items */}
        <View className="flex-1 px-4 py-4">
          {drawerItems.map((item) => {
            const isActive = isActiveRoute(item.route);
            return (
              <TouchableOpacity
                key={item.name}
                className={`flex-row items-center px-4 py-3 rounded-lg mb-1 ${
                  isActive ? 'bg-blue-50' : 'bg-transparent'
                }`}
                onPress={() => handleNavigation(item.route)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={isActive ? '#3B82F6' : '#6B7280'}
                />
                <Text
                  className={`ml-3 text-base font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View className="px-4 py-4 border-t border-gray-100">
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 rounded-lg"
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="ml-3 text-base font-medium text-red-500">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};