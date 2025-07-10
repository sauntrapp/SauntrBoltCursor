import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, Compass, Heart, Map, User } from 'lucide-react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, Platform, Modal, TouchableOpacity, Alert } from 'react-native';
import { TriangleAlert as AlertTriangle, X } from 'lucide-react-native';
import { useState } from 'react';

export default function TabLayout() {
  const { state, clearLikedVenues, setDiscoverySession } = useApp();
  const router = useRouter();
  const [showClearModal, setShowClearModal] = useState(false);
  const likedCount = state.likedVenues.length;

  const triggerHapticFeedback = () => {
    // Haptic feedback removed for web compatibility
  };

  const handleHomePress = async () => {
    console.log('🏠 Home tab pressed');
    console.log('📊 Current state:', {
      likedVenuesCount: state.likedVenues.length,
      isAuthenticated: state.isAuthenticated,
      currentLocation: state.currentLocation?.address
    });
    
    if (state.likedVenues.length > 0) {
      console.log('✅ Showing clear modal for', state.likedVenues.length, 'liked venues');
      setShowClearModal(true);
    } else {
      console.log('🔄 No liked venues, just clearing session');
      await setDiscoverySession(null);
      // Navigate to home tab
      router.push('/(tabs)');
    }
  };

  const handleClearAndContinue = async () => {
    console.log('🗑️ Clearing liked venues and closing modal');
    await clearLikedVenues();
    await setDiscoverySession(null);
    setShowClearModal(false);
    // Navigate to home tab
    router.push('/(tabs)');
  };

  const handleCancelClear = () => {
    console.log('❌ Canceling clear action');
    setShowClearModal(false);
    // Still navigate to home tab without clearing
    router.push('/(tabs)');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#10B981', // Emerald green
          tabBarInactiveTintColor: '#6B7280', // Gray
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarLabelPosition: 'below-icon',
        }}
        screenListeners={{
          tabPress: () => {
            triggerHapticFeedback();
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              // Handle our custom home action
              handleHomePress();
            },
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size, focused }) => (
              <Compass color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              // Navigate to location select screen
              router.push('/location-select');
            },
          }}
        />
        <Tabs.Screen
          name="likes"
          options={{
            title: 'Likes',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.iconContainer}>
                <Heart 
                  color={color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                  fill={focused ? color : 'transparent'}
                />
                {likedCount > 0 && (
                  <View style={styles.iconBadge}>
                    <Text style={styles.iconBadgeText}>
                      {likedCount > 99 ? '99+' : likedCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size, focused }) => (
              <Map color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
      </Tabs>

      {/* Clear Liked Venues Modal */}
      <Modal
        visible={showClearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.warningIconContainer}>
                <AlertTriangle color="#F59E0B" size={32} />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowClearModal(false)}
              >
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Clear Liked Venues?</Text>
            <Text style={styles.modalMessage}>
              This will clear all your currently liked venues ({state.likedVenues.length} venues). 
              This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelClear}
              >
                <Text style={styles.cancelButtonText}>Keep & Continue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleClearAndContinue}
              >
                <Text style={styles.confirmButtonText}>Clear Venues</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 90 : 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#717171',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#484848',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF385C',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});