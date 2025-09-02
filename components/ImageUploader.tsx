import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { validateImageFile } from '../lib/validation';
import { storageService } from '../services/storage.service';

interface ImageUploaderProps {
  currentImage?: string | null;
  aspectRatio: 'square' | 'banner';
  onUpload: (imageUrl: string) => void;
  onDelete?: () => void;
  maxSizeKB?: number;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  aspectRatio,
  onUpload,
  onDelete,
  maxSizeKB = 5120, // 5MB default
  placeholder,
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return {
      camera: cameraStatus === 'granted',
      mediaLibrary: mediaLibraryStatus === 'granted',
    };
  };

  const processImageUpload = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.[0] || !user) {
      return;
    }

    const asset = result.assets[0];
    
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate image
      const imageData = {
        uri: asset.uri,
        type: aspectRatio,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
      };

      validateImageFile(imageData);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 100);

      // Upload image
      const imageFile = {
        uri: asset.uri,
        name: asset.fileName || `${aspectRatio}-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
        size: asset.fileSize,
      };

      const imageUrl = await storageService.uploadImage(
        imageFile,
        user.id,
        aspectRatio === 'square' ? 'profile' : 'banner'
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update profile with new image URL
      const updateField = aspectRatio === 'square' ? 'profileImage' : 'bannerImage';
      await useAuth().updateProfile({ [updateField]: imageUrl });

      onUpload(imageUrl);

      Alert.alert(
        'Success',
        'Image uploaded successfully!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowCameraModal(false);
    }
  };

  const handleCameraCapture = async () => {
    const permissions = await requestPermissions();
    
    if (!permissions.camera) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permission to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio === 'square' ? [1, 1] : [3, 1],
        quality: 0.8,
      });

      await processImageUpload(result);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const handleGallerySelection = async () => {
    const permissions = await requestPermissions();
    
    if (!permissions.mediaLibrary) {
      Alert.alert(
        'Photo Library Permission Required',
        'Please enable photo library permission to select images.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio === 'square' ? [1, 1] : [3, 1],
        quality: 0.8,
      });

      await processImageUpload(result);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to access photo library. Please try again.');
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImage || !onDelete) return;

    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteImage(currentImage);
              onDelete();
              Alert.alert('Success', 'Image deleted successfully!');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete image. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderImagePreview = () => {
    const containerClass = aspectRatio === 'square' 
      ? 'w-24 h-24 rounded-full'
      : 'w-full h-32 rounded-lg';

    if (currentImage) {
      return (
        <View className={`${containerClass} relative`}>
          <Image 
            source={{ uri: currentImage }} 
            className={`${containerClass} bg-gray-200`}
            style={{ resizeMode: 'cover' }}
          />
          {onDelete && (
            <TouchableOpacity
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
              onPress={handleDeleteImage}
            >
              <Ionicons name="close" size={12} color="white" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View className={`${containerClass} bg-gray-200 items-center justify-center border-2 border-dashed border-gray-300`}>
        <Ionicons 
          name={aspectRatio === 'square' ? 'person' : 'image'} 
          size={aspectRatio === 'square' ? 24 : 32} 
          color="#9CA3AF" 
        />
        {placeholder && (
          <Text className="text-gray-500 text-xs mt-1 text-center">
            {placeholder}
          </Text>
        )}
      </View>
    );
  };

  const renderUploadProgress = () => {
    if (!isUploading) return null;

    return (
      <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white text-sm mt-2">{uploadProgress}%</Text>
      </View>
    );
  };

  const renderCameraModal = () => (
    <Modal
      visible={showCameraModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCameraModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
            Choose Photo Source
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-50 rounded-xl"
              onPress={handleCameraCapture}
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Take Photo</Text>
                <Text className="text-gray-600 text-sm">Use your camera</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-50 rounded-xl"
              onPress={handleGallerySelection}
            >
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="images" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Choose from Gallery</Text>
                <Text className="text-gray-600 text-sm">Select existing photo</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            className="mt-6 p-4 border border-gray-300 rounded-xl"
            onPress={() => setShowCameraModal(false)}
          >
            <Text className="text-gray-600 font-semibold text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowCameraModal(true)}
        disabled={isUploading}
        className="relative"
      >
        {renderImagePreview()}
        {renderUploadProgress()}
        
        {!isUploading && (
          <View className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full items-center justify-center border-2 border-white">
            <Ionicons name="camera" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
      
      {renderCameraModal()}
    </View>
  );
};