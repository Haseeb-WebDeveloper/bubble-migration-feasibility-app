# Bubble App - User Profile Management System

A comprehensive React Native Expo application for user profile management with magic link authentication, image uploads, and real-time profile synchronization.

## 🚀 Features

### Authentication System
- **Magic Link Authentication**: Passwordless email-only login
- **Session Management**: Secure session handling with Supabase Auth
- **Protected Routes**: Automatic redirect logic for authenticated/unauthenticated users
- **Auto-refresh**: Automatic token refresh and session persistence

### Profile Management
- **Personal Information**: Name, email, country, bio management
- **Image Upload**: Profile picture and banner image with camera/gallery integration
- **Real-time Sync**: Instant profile updates across the app
- **Form Validation**: Comprehensive validation with Zod schemas

### Image Management
- **Camera Integration**: Take photos directly with device camera
- **Gallery Selection**: Choose from device photo library
- **File Validation**: Size, type, and dimension validation
- **Progress Tracking**: Real-time upload progress indicators
- **Auto Cleanup**: Automatic removal of old images when new ones are uploaded

### User Interface
- **Modern Design**: Clean, responsive UI with Tailwind CSS
- **Drawer Navigation**: Intuitive side navigation
- **Dashboard**: Profile header, welcome section, stats cards, and quick actions
- **Settings**: Tabbed interface for profile, images, and account management

## 🛠 Technology Stack

- **Frontend**: React Native with Expo SDK 51+
- **Backend**: Supabase (Authentication + Database + Storage)
- **Database**: PostgreSQL with Prisma ORM
- **Package Manager**: Bun
- **UI Styling**: Tailwind CSS with NativeWind
- **Navigation**: Expo Router (file-based routing)
- **Forms**: React Hook Form with Zod validation
- **Images**: Expo ImagePicker + Camera + Media Library

## 📱 App Structure

```
app/
├── (authenticated)/          # Protected routes
│   ├── _layout.tsx          # Drawer navigation layout
│   ├── dashboard.tsx        # Main dashboard screen
│   └── settings.tsx         # Profile settings screen
├── auth/                    # Authentication screens
│   ├── login.tsx           # Email input for magic link
│   ├── magic-link-sent.tsx # Confirmation screen
│   └── callback.tsx        # Auth callback handler
├── _layout.tsx             # Root layout with AuthProvider
└── index.tsx               # Route dispatcher
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16+)
- Bun package manager
- Expo CLI
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd bubble-fesibility
bun install
```

### 2. Environment Configuration
Create `.env` file in the root directory:
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
EXPO_PUBLIC_APP_NAME=Bubble App
EXPO_PUBLIC_APP_VERSION=1.0.0

# Image Upload Configuration
EXPO_PUBLIC_MAX_IMAGE_SIZE_MB=5
EXPO_PUBLIC_SUPPORTED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Storage Configuration
EXPO_PUBLIC_STORAGE_BUCKET=user-images
```

### 3. Supabase Setup

#### Database Schema
Run this SQL in your Supabase SQL editor:
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  bio TEXT,
  avatar_url TEXT,
  profile_image TEXT,
  banner_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

#### Storage Setup
1. Create a storage bucket named `user-images`
2. Set bucket to public
3. Configure RLS policies for the bucket:
```sql
-- Storage policies
CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own images" ON storage.objects FOR SELECT USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Run the Application
```bash
# Start development server
bun start

# Run on specific platforms
bun run android   # Android emulator
bun run ios       # iOS simulator
bun run web       # Web browser
```

## 🔐 Authentication Flow

1. **Login**: User enters email address
2. **Magic Link**: Supabase sends magic link to email
3. **Verification**: User clicks link to authenticate
4. **Session**: App receives session and redirects to dashboard
5. **Profile**: Auto-create profile if doesn't exist

## 📊 Database Schema

### Profiles Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | User's full name |
| email | TEXT | User's email address |
| country | TEXT | User's country |
| bio | TEXT | User's bio (max 500 chars) |
| avatar_url | TEXT | Legacy avatar URL |
| profile_image | TEXT | Profile image URL |
| banner_image | TEXT | Banner image URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## 🎨 UI Components

### Core Components
- **ProfileHeader**: Banner and profile image display
- **WelcomeSection**: Personalized greeting
- **StatsCards**: Account status and metrics
- **QuickActions**: Navigation shortcuts
- **ProfileForm**: Editable profile information
- **ImageUploader**: Camera/gallery image selection
- **DrawerContent**: Navigation sidebar

### Form Validation
- **Email**: Valid email format required
- **Name**: Optional, max 100 characters
- **Country**: Dropdown selection
- **Bio**: Optional, max 500 characters
- **Images**: Max 5MB, JPEG/PNG/WebP only

## 🔧 Development

### Project Structure
```
├── app/                     # Expo Router pages
├── components/              # Reusable UI components
├── contexts/               # React contexts (Auth)
├── lib/                    # Utilities and configurations
├── services/               # API service layers
└── prisma/                 # Database schema
```

### Key Services
- **AuthService**: Authentication operations
- **ProfileService**: Profile CRUD operations
- **StorageService**: Image upload/management

### State Management
- **AuthContext**: Global authentication state
- **React Hook Form**: Form state management
- **Supabase**: Backend state synchronization

## 🚀 Deployment

### Development Build
```bash
npx expo install --fix
npx expo prebuild
```

### Production Build
```bash
eas build --platform all
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Email authentication flow
- [ ] Magic link verification
- [ ] Profile creation and updates
- [ ] Image upload from camera
- [ ] Image upload from gallery
- [ ] Form validation
- [ ] Navigation between screens
- [ ] Sign out functionality

### Common Issues
1. **Missing environment variables**: Check `.env` file
2. **Supabase connection**: Verify URL and API keys
3. **Storage permissions**: Check bucket policies
4. **Image upload**: Verify file size and format

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions:
- Create GitHub issue
- Check Supabase documentation
- Review Expo documentation