import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ProfileFormData, profileFormSchema } from '../lib/validation';
import { Profile } from '../lib/database.types';

interface ProfileFormProps {
  initialData: Profile;
  onSuccess?: () => void;
}

// Common countries list
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Japan', 'South Korea', 'China', 'India',
  'Brazil', 'Mexico', 'Argentina', 'South Africa', 'Nigeria', 'Egypt',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria',
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData.name || '',
      country: initialData.country || '',
      bio: initialData.bio || '',
      email: initialData.email,
    },
  });

  const bioValue = watch('bio');
  const bioLength = bioValue?.length || 0;

  const onSubmit = async (data: ProfileFormData) => {
    if (isSubmitting || !isDirty) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        name: data.name || null,
        country: data.country || null,
        bio: data.bio || null,
      };

      const result = await updateProfile(updateData);
      
      if (result) {
        Alert.alert(
          'Success',
          'Your profile has been updated successfully!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(
        'Error',
        'Failed to update your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCountryPicker = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center z-50">
      <View className="bg-white rounded-2xl mx-4 max-h-96 w-full">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">
              Select Country
            </Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView className="max-h-72">
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country}
              className="p-4 border-b border-gray-100"
              onPress={() => {
                setValue('country', country, { shouldDirty: true });
                setShowCountryPicker(false);
              }}
            >
              <Text className="text-gray-900">{country}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-6 mx-4 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Personal Information
          </Text>

          {/* Name Field */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Full Name
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-lg px-4 py-3 text-base ${
                    errors.name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </Text>
            )}
          </View>

          {/* Email Field (Read-only) */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Email Address
            </Text>
            <View className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-100">
              <Text className="text-gray-600 text-base">{initialData.email}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              Email cannot be changed
            </Text>
          </View>

          {/* Country Field */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Country
            </Text>
            <Controller
              control={control}
              name="country"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between"
                  onPress={() => setShowCountryPicker(true)}
                  disabled={isSubmitting}
                >
                  <Text className={`text-base ${value ? 'text-gray-900' : 'text-gray-500'}`}>
                    {value || 'Select your country'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            />
            {errors.country && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.country.message}
              </Text>
            )}
          </View>

          {/* Bio Field */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 text-sm font-medium">
                Bio
              </Text>
              <Text className={`text-xs ${bioLength > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {bioLength}/500
              </Text>
            </View>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-lg px-4 py-3 text-base h-24 ${
                    errors.bio
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#9CA3AF"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.bio && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.bio.message}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-lg py-4 items-center ${
              isDirty && isValid && !isSubmitting
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">
                  Updating...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-base">
                Update Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showCountryPicker && renderCountryPicker()}
    </>
  );
};