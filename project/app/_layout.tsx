import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '@/lib/appContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="auth" 
            options={{ 
              presentation: 'modal',
              animation: Platform.OS === 'web' ? 'none' : 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="onboarding" 
            options={{ 
              presentation: 'modal',
              animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="instaplan" 
            options={{ 
              presentation: 'modal',
              animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
            }} 
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});