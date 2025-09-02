import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';

export default function AuthCallbackScreen() {
  const { url } = useLocalSearchParams<{ url?: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { refreshProfile } = useAuth();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setStatus('loading');

      // Get the URL from params or current URL
      const callbackUrl = url || (await Linking.getInitialURL()) || Linking.createURL('/auth/callback');
      
      console.log('Processing callback URL:', callbackUrl);

      // Handle the auth callback
      await authService.handleAuthCallback(callbackUrl);
      
      // Refresh profile data
      await refreshProfile();
      
      setStatus('success');
      
      // Redirect to dashboard after successful authentication
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Authentication failed. Please try again.'
      );
      
      // Redirect to login after error
      setTimeout(() => {
        router.replace('/auth/login');
      }, 3000);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              Signing you in...
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Please wait while we verify your magic link
            </Text>
          </>
        );
      
      case 'success':
        return (
          <>
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
              <Text className="text-green-600 text-2xl">✓</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              Welcome back!
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Redirecting you to your dashboard...
            </Text>
          </>
        );
      
      case 'error':
        return (
          <>
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center">
              <Text className="text-red-600 text-2xl">✕</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              Authentication Failed
            </Text>
            <Text className="text-gray-600 text-center mt-2 px-4">
              {errorMessage}
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-4">
              Redirecting to login...
            </Text>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}