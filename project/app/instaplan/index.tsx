import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Zap, MapPin, Clock, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateInstaPlan } from '../../lib/instaPlanService';

export default function InstaPlanScreen() {
  const { state, setCurrentLocation } = useApp();
  const router = useRouter();
  const { autoGenerate } = useLocalSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your location...');

  const loadingMessages = [
    'Analyzing your location...',
    'Checking current weather conditions...',
    'Finding the perfect venue combinations...',
    'Optimizing your adventure timeline...',
    'Creating your personalized plan...',
    'Almost ready! Finalizing details...'
  ];

  useEffect(() => {
    // Auto-generate if requested
    if (autoGenerate === 'true') {
      handleGeneratePlan();
    }
  }, [autoGenerate]);

  useEffect(() => {
    if (isGenerating) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleBack = () => {
    // Navigate back to the welcome screen (tabs index)
    router.push('/(tabs)');
  };
  const handleGeneratePlan = async () => {
    // Check if location is set
    if (!state.currentLocation) {
      // Set a default location for demo
      await setCurrentLocation({
        address: 'Current Location',
        coordinates: '40.7589,-73.9851',
        lat: 40.7589,
        lng: -73.9851,
        radius: 2,
      });
    }

    setIsGenerating(true);

    try {
      // Generate the plan
      const plan = await generateInstaPlan(state.currentLocation || {
        address: 'Current Location',
        coordinates: '40.7589,-73.9851',
        lat: 40.7589,
        lng: -73.9851,
        radius: 2,
      });

      // Navigate to results with the plan
      router.push({
        pathname: '/instaplan/result',
        params: { planData: JSON.stringify(plan) }
      });
    } catch (error) {
      console.error('Failed to generate plan:', error);
      // Handle error - for now just stop loading
      setIsGenerating(false);
    }
  };

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const getTimeBasedDescription = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Start your day with a perfect morning adventure';
    if (hour < 14) return 'Discover the perfect afternoon experience';
    if (hour < 18) return 'Create an amazing evening adventure';
    if (hour < 22) return 'Find the perfect night out';
    return 'Discover late-night gems in your area';
  };

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <View style={styles.loadingLogoContainer}>
              <Image 
                source={require('@/assets/images/sauntr_logo_12x12in_no_text.png')} 
                style={styles.loadingLogo}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.loadingIconContainer}>
              <Zap color="#FFFFFF" size={48} />
            </View>
            
            <Text style={styles.loadingTitle}>Creating Your InstaPlan</Text>
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
            
            <View style={styles.loadingIndicator}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
              <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Zap color="#FFFFFF" size={32} />
            <Text style={styles.title}>InstaPlan</Text>
            <Text style={styles.subtitle}>
              AI-generated 2-3 hour adventure
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getCurrentTimeGreeting()}!</Text>
          <Text style={styles.greetingSubtext}>
            {getTimeBasedDescription()}
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Sparkles color="#8B5CF6" size={24} />
            </View>
            <Text style={styles.featureTitle}>Smart Curation</Text>
            <Text style={styles.featureDescription}>
              AI selects 3 perfect venues that work together as a complete experience
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Clock color="#10B981" size={24} />
            </View>
            <Text style={styles.featureTitle}>Perfect Timing</Text>
            <Text style={styles.featureDescription}>
              Optimized for current time, weather, and venue availability
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <MapPin color="#3B82F6" size={24} />
            </View>
            <Text style={styles.featureTitle}>Logical Flow</Text>
            <Text style={styles.featureDescription}>
              Venues are arranged in a sensible geographic and experiential sequence
            </Text>
          </View>
        </View>

        {/* Current Conditions */}
        <View style={styles.conditionsCard}>
          <Text style={styles.conditionsTitle}>Current Conditions</Text>
          <View style={styles.conditionsGrid}>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Time</Text>
              <Text style={styles.conditionValue}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Weather</Text>
              <Text style={styles.conditionValue}>72° Partly Cloudy</Text>
            </View>
            <View style={styles.conditionItem}>
              <Text style={styles.conditionLabel}>Location</Text>
              <Text style={styles.conditionValue} numberOfLines={1}>
                {state.currentLocation?.address || 'Current Location'}
              </Text>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGeneratePlan}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.generateGradient}
          >
            <Zap color="#FFFFFF" size={24} />
            <Text style={styles.generateButtonText}>Generate My InstaPlan</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Your plan will include 3 carefully selected venues with estimated timing and directions
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingLogoContainer: {
    width: 80,
    height: 80,
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  loadingLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  loadingDotDelay1: {
    opacity: 0.8,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  greetingSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  greetingSubtext: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  featuresGrid: {
    marginBottom: 24,
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#717171',
    lineHeight: 18,
    fontWeight: '500',
  },
  conditionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  conditionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  conditionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conditionItem: {
    flex: 1,
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 12,
    color: '#717171',
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '700',
    textAlign: 'center',
  },
  generateButton: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 13,
    color: '#717171',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});