import { z } from 'zod';

// Authentication schemas
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type EmailFormData = z.infer<typeof emailSchema>;

// Profile form schema
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(100, 'Country name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email format').readonly(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

// Image upload schema
export const imageUploadSchema = z.object({
  uri: z.string().min(1, 'Image URI is required'),
  type: z.enum(['profile', 'banner'], {
    required_error: 'Image type is required',
    invalid_type_error: 'Image type must be either profile or banner',
  }),
  size: z
    .number()
    .positive('File size must be positive')
    .max(5242880, 'File size must be less than 5MB'), // 5MB in bytes
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    required_error: 'Image format is required',
    invalid_type_error: 'Supported formats: JPEG, PNG, WebP',
  }),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export type ImageUploadData = z.infer<typeof imageUploadSchema>;

// Image validation helper
export const validateImageFile = (imageInfo: {
  uri: string;
  type: 'profile' | 'banner';
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}) => {
  return imageUploadSchema.parse({
    uri: imageInfo.uri,
    type: imageInfo.type,
    size: imageInfo.fileSize || 0,
    mimeType: imageInfo.mimeType || 'image/jpeg',
    width: imageInfo.width,
    height: imageInfo.height,
  });
};

// Profile update schema (for API calls)
export const profileUpdateSchema = z.object({
  name: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  profileImage: z.string().url().nullable().optional(),
  bannerImage: z.string().url().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;