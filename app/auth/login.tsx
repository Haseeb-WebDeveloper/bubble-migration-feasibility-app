import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { EmailFormData, emailSchema } from '../../lib/validation';
import { PublicRoute } from '../../components/ProtectedRoute';

export default function LoginScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithMagicLink } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');

  const onSubmit = async (data: EmailFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await signInWithMagicLink(data.email);
      
      if (error) {
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to send magic link. Please try again.',
          [{ text: 'OK' }]
        );
      } else {
        router.push({
          pathname: '/auth/magic-link-sent',
          params: { email: data.email },
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicRoute>
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6">
                <Text className="text-white text-2xl font-bold"> B</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Bubble App
              </Text>
              <Text className="text-gray-600 text-center text-base">
                Enter your email to receive a magic link
              </Text>
            </View>

            {/* Login Form */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="mb-6">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-lg px-4 py-3 text-base ${
                        errors.email
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className={`rounded-lg py-4 items-center ${
                  isValid && email && !isSubmitting
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || !email || isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Sending...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Send Magic Link
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <Text className="text-gray-500 text-sm text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PublicRoute>
  );
}