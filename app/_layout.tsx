import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle incoming URL links (magic links)
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      // Check if it's an auth callback URL
      if (url.includes('/auth/callback') || url.includes('access_token')) {
        // Navigate to callback screen with the URL
        router.push({
          pathname: '/auth/callback',
          params: { url }
        });
      }
    };

    // Handle the URL that was used to open the app
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Listen for incoming URLs while app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    getInitialURL();

    return () => subscription?.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth/login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth/magic-link-sent"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth/callback"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(authenticated)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
