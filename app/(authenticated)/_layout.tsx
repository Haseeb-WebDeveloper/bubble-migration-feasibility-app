import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '../../components/DrawerContent';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            drawerStyle: {
              width: 280,
            },
          }}
        >
          <Drawer.Screen
            name="dashboard"
            options={{
              drawerLabel: 'Dashboard',
              title: 'Dashboard',
            }}
          />
          <Drawer.Screen
            name="settings"
            options={{
              drawerLabel: 'Settings',
              title: 'Settings',
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </ProtectedRoute>
  );
}