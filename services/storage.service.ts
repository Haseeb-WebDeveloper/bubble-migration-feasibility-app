import { supabase, STORAGE_BUCKET, MAX_IMAGE_SIZE_MB, SUPPORTED_IMAGE_TYPES } from '../lib/supabase';

export interface StorageService {
  uploadImage(file: ImageFile, userId: string, type: 'profile' | 'banner'): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
  getPublicUrl(path: string): string;
}

export interface ImageFile {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error?: string;
}

class StorageServiceImpl implements StorageService {
  async uploadImage(file: ImageFile, userId: string, type: 'profile' | 'banner'): Promise<string> {
    try {
      // Validate file
      this.validateImageFile(file);

      // Generate unique file path
      const timestamp = Date.now();
      const extension = this.getFileExtension(file.name || file.uri);
      const fileName = `${type}-${timestamp}.${extension}`;
      const filePath = `${userId}/${fileName}`;

      // Convert file URI to blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Get public URL
      const publicUrl = this.getPublicUrl(data.path);
      
      // Clean up old images if they exist
      await this.cleanupOldImages(userId, type, data.path);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const path = this.extractPathFromUrl(imageUrl);
      
      if (path) {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([path]);

        if (error) {
          console.error('Storage delete error:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Image deletion failed:', error);
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  private validateImageFile(file: ImageFile): void {
    // Check file size
    if (file.size && file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      throw new Error(`File size must be less than ${MAX_IMAGE_SIZE_MB}MB`);
    }

    // Check file type
    if (file.type && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Supported formats: JPEG, PNG, WebP');
    }
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts[parts.length - 1]?.toLowerCase() || 'jpg';
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === STORAGE_BUCKET);
      
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join('/');
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }

  private async cleanupOldImages(userId: string, type: 'profile' | 'banner', currentPath: string): Promise<void> {
    try {
      // List all files in user's directory
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(userId);

      if (error || !files) {
        console.warn('Could not list files for cleanup:', error);
        return;
      }

      // Find old files of the same type
      const oldFiles = files.filter(file => 
        file.name.startsWith(`${type}-`) && 
        `${userId}/${file.name}` !== currentPath
      );

      // Delete old files
      if (oldFiles.length > 0) {
        const pathsToDelete = oldFiles.map(file => `${userId}/${file.name}`);
        
        const { error: deleteError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(pathsToDelete);

        if (deleteError) {
          console.warn('Could not delete old files:', deleteError);
        }
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }
}

export const storageService = new StorageServiceImpl();