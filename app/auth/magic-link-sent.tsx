import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PublicRoute } from '../../components/ProtectedRoute';

export default function MagicLinkSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { signInWithMagicLink } = useAuth();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendLink = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        Alert.alert(
          'Error',
          error.message || 'Failed to resend magic link. Please try again.',
          [{ text: 'OK' }]
        );
      } else {
        setResendCooldown(60); // 60 second cooldown
        Alert.alert(
          'Magic Link Sent',
          'A new magic link has been sent to your email.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (!email) {
    router.replace('/auth/login');
    return null;
  }

  return (
    <PublicRoute>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center px-6">
          {/* Success Icon */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </Text>
            <Text className="text-gray-600 text-center text-base">
              We've sent a magic link to
            </Text>
            <Text className="text-blue-600 font-semibold text-base mt-1">
              {email}
            </Text>
          </View>

          {/* Instructions */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <Text className="text-gray-700 text-base leading-6 text-center">
              Click the link in your email to sign in to your account. The link will expire in 1 hour.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            {/* Resend Button */}
            <TouchableOpacity
              className={`rounded-lg py-4 items-center border ${
                resendCooldown > 0 || isResending
                  ? 'bg-gray-100 border-gray-200'
                  : 'bg-white border-blue-600'
              }`}
              onPress={handleResendLink}
              disabled={resendCooldown > 0 || isResending}
            >
              {isResending ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-blue-600 font-semibold ml-2">
                    Sending...
                  </Text>
                </View>
              ) : resendCooldown > 0 ? (
                <Text className="text-gray-400 font-semibold">
                  Resend in {resendCooldown}s
                </Text>
              ) : (
                <Text className="text-blue-600 font-semibold">
                  Resend Magic Link
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Button */}
            <TouchableOpacity
              className="rounded-lg py-4 items-center"
              onPress={handleBackToLogin}
            >
              <Text className="text-gray-600 font-medium">
                Use Different Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-gray-500 text-sm text-center">
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </PublicRoute>
  );
}