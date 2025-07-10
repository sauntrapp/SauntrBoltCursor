import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Image } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { 
  Sparkles, 
  Zap, 
  User, 
  LogOut, 
  ArrowRight,
  TriangleAlert as AlertTriangle, 
  X 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import SamuelSauntrWidget from '@/components/SamuelSauntrWidget';

export default function WelcomeScreen() {
  const { state, signIn, signOut, setCurrentLocation } = useApp();
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Auto-sign in for development
    if (!state.isAuthenticated && !state.isLoading) {
      // Always auto-sign in with mock data in development
      signIn('demo@example.com', 'password').catch(console.error);
    }
  }, [state.isAuthenticated, state.isLoading, signIn]);

  const triggerHapticFeedback = () => {
    // Haptic feedback removed for web compatibility
  };

  const handleQuickStart = () => {
    if (!state.currentLocation) {
      router.push('/(tabs)/discover');
    } else {
      router.push('/(tabs)/discover');
    }
  };

  const handleEntryPoint = (type: 'surprise' | 'custom' | 'instaplan') => {
    proceedWithEntryPoint(type);
  };

  const proceedWithEntryPoint = (type: 'surprise' | 'custom' | 'instaplan') => {
    triggerHapticFeedback();
    
    switch (type) {
      case 'surprise':
        // Always start with location setup for surprise me flow
        router.push('/onboarding/location');
        break;
      case 'instaplan':
        // Start generating InstaPlan immediately
        handleInstaPlanGeneration();
        break;
    }
  };

  const handleInstaPlanGeneration = async () => {
    // Ensure location is set
    if (!state.currentLocation) {
      await setCurrentLocation({
        address: 'Current Location',
        coordinates: '40.7589,-73.9851',
        lat: 40.7589,
        lng: -73.9851,
        radius: 2,
      });
    }
    
    // Navigate directly to InstaPlan with auto-generation
    router.push('/instaplan?autoGenerate=true');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const getUserDisplayName = () => {
    if (!state.user?.email) return 'User';
    return state.user.name || state.user.email.split('@')[0];
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingLogoContainer}>
            <Image 
              source={require('@/assets/images/sauntr_logo_12x12in_no_text.png')} 
              style={styles.loadingLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.loadingBrandText}>SAUNTR</Text>
          <Text style={styles.loadingText}>Loading your adventure...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Samuel Sauntr Widget - Top Priority */}
      <View style={styles.topWidgetContainer}>
        <SamuelSauntrWidget 
          location={state.currentLocation?.address}
          onLocationPress={() => router.push('/onboarding/location')}
          context="welcome"
        />
      </View>

      {/* Header with Auth */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />

        {/* Auth Controls */}
        <View style={styles.authControls}>
          {state.isAuthenticated ? (
            <TouchableOpacity style={styles.userButton} onPress={handleSignOut}>
              <User color="#6B7280" size={20} />
              <LogOut color="#6B7280" size={16} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => router.push('/auth')}
            >
              <User color="#6B7280" size={20} />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Brand Identity */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/sauntr_logo_12x12in_no_text.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandTitle}>SAUNTR</Text>
        <Text style={styles.brandTagline}>The new way to get lost</Text>
        
        {state.isAuthenticated && (
          <Text style={styles.welcomeMessage}>
            Welcome, {getUserDisplayName()}!
          </Text>
        )}
      </View>

      {/* Entry Point Cards */}
      <View style={styles.entryPointsContainer}>
        {/* Surprise Me Card */}
        <TouchableOpacity
          style={styles.entryCard}
          onPress={() => handleEntryPoint('surprise')}
          activeOpacity={0.95}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <Sparkles color="#FFFFFF" size={28} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Let's explore!</Text>
                <Text style={styles.cardSubtitle}>Quick adventure based on your vibe</Text>
                <Text style={styles.cardDescription}>
                  Let AI pick the perfect spot for your mood and location
                </Text>
              </View>
              <ArrowRight color="#FFFFFF" size={20} style={styles.cardArrow} />
            </View>
          </LinearGradient>
        </TouchableOpacity>


        {/* InstaPlan Card */}
        <TouchableOpacity
          style={styles.entryCard}
          onPress={() => handleEntryPoint('instaplan')}
          activeOpacity={0.95}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <Zap color="#FFFFFF" size={28} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>I need an Insta-Plan</Text>
                <Text style={styles.cardSubtitle}>AI-generated 2-3 hour itinerary</Text>
                <Text style={styles.cardDescription}>
                  Get an instant balanced plan with 3 perfect venues
                </Text>
              </View>
              <ArrowRight color="#FFFFFF" size={20} style={styles.cardArrow} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom CTA for Unauthenticated Users */}
      {!state.isAuthenticated && (
        <View style={styles.bottomCTA}>
          <LinearGradient
            colors={['#F3F4F6', '#E5E7EB']}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>Save Your Adventures</Text>
            <View style={styles.ctaFeatures}>
              <Text style={styles.ctaFeature}>• Save favorite venues and create collections</Text>
              <Text style={styles.ctaFeature}>• Get personalized recommendations</Text>
              <Text style={styles.ctaFeature}>• Track your discovery journey</Text>
            </View>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.ctaButtonText}>Create Free Account</Text>
              <ArrowRight color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topWidgetContainer: {
    paddingHorizontal: 20,
    paddingTop: 60, // Account for status bar
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingLogoContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  loadingLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  loadingBrandText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16, // Reduced since widget now handles top spacing
    paddingBottom: 20,
  },
  topBarSpacer: {
    flex: 1,
  },
  authControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  signInButtonText: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '600',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  brandSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  logo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '700',
    color: '#222222',
    letterSpacing: -1.5,
  },
  brandTagline: {
    fontSize: 18,
    color: '#717171',
    marginTop: 12,
    fontWeight: '500',
  },
  welcomeMessage: {
    fontSize: 17,
    color: '#484848',
    marginTop: 20,
    fontWeight: '600',
  },
  entryPointsContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  entryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 15,
    fontWeight: '400',
  },
  cardArrow: {
    marginLeft: 10,
    opacity: 0.8,
  },
  bottomCTA: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaGradient: {
    padding: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 14,
  },
  ctaFeatures: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  ctaFeature: {
    fontSize: 13,
    color: '#717171',
    marginBottom: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});