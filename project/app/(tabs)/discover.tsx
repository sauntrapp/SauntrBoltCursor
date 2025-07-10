import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { Compass, Sparkles, Settings, Zap, Play, RotateCcw, MapPin, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeCard from '@/components/SwipeCard';
import { MOCK_VENUES } from '@/lib/mockData';
import { Venue } from '@/lib/types';
import SamuelSauntrWidget from '@/components/SamuelSauntrWidget';

const { width } = Dimensions.get('window');

interface WeatherCondition {
  temperature: number;
  condition: string;
  isRaining: boolean;
  suitability: 'indoor' | 'outdoor' | 'both';
}

export default function DiscoverScreen() {
  const { state, setDiscoverySession, addLikedVenue } = useApp();
  const router = useRouter();
  const isMounted = useRef(true);
  
  // Discovery state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>({
    temperature: 72,
    condition: 'Partly Cloudy',
    isRaining: false,
    suitability: 'both'
  });
  
  // Filters
  const [distanceFilter, setDistanceFilter] = useState(state.currentLocation?.radius || 2); // miles
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    if (state.discoverySession && state.discoverySession.venues.length > 0) {
      setVenues(state.discoverySession.venues);
      setCurrentIndex(state.discoverySession.currentIndex);
      setSessionActive(true);
    } else if (state.discoverySession && state.discoverySession.venues.length === 0) {
      // If we have a session but no venues, start a new discovery session
      startNewDiscoverySession();
    }

    // Load weather data
    loadWeatherData();

    return () => {
      isMounted.current = false;
    };
  }, [state.discoverySession]);

  const loadWeatherData = async () => {
    // Mock weather data - in production, use OpenWeather API
    const mockWeather: WeatherCondition = {
      temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      isRaining: Math.random() > 0.7,
      suitability: Math.random() > 0.5 ? 'outdoor' : 'indoor'
    };
    
    setWeatherCondition(mockWeather);
  };

  const startNewDiscoverySession = async () => {
    if (!state.currentLocation) {
      Alert.alert(
        'Location Required',
        'Please set your location first to discover venues near you.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Location', onPress: () => router.push('/location-select') }
        ]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call with weather-influenced venue selection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!isMounted.current) return;

      // Filter venues based on weather and preferences
      let filteredVenues = [...MOCK_VENUES];
      
      // Weather-based filtering
      if (weatherCondition.isRaining) {
        filteredVenues = filteredVenues.filter(venue => 
          venue.weatherSuitability === 'indoor' || venue.weatherSuitability === 'both'
        );
      }

      // Apply distance filter (mock implementation)
      filteredVenues = filteredVenues.filter(() => Math.random() > 0.2); // Simulate distance filtering

      // Shuffle for variety and ensure we have at least 10 venues
      const shuffledVenues = filteredVenues.sort(() => Math.random() - 0.5).slice(0, Math.max(10, filteredVenues.length));
      
      setVenues(shuffledVenues);
      setCurrentIndex(0);
      setSessionActive(true);

      // Save session to app state
      await setDiscoverySession({
        type: state.discoverySession?.type || 'surprise',
        venues: shuffledVenues,
        currentIndex: 0,
        selectedLocation: state.currentLocation,
        selectedVibes: state.discoverySession?.selectedVibes || [],
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to load venues. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeLeft = async () => {
    if (currentIndex < venues.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Update session state
      if (state.discoverySession) {
        await setDiscoverySession({
          ...state.discoverySession,
          currentIndex: newIndex
        });
      }
    } else {
      handleSessionComplete();
    }
  };

  const handleSwipeRight = async () => {
    const currentVenue = venues[currentIndex];
    await addLikedVenue(currentVenue);
    
    if (currentIndex < venues.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Update session state
      if (state.discoverySession) {
        await setDiscoverySession({
          ...state.discoverySession,
          currentIndex: newIndex
        });
      }
    } else {
      handleSessionComplete();
    }
  };

  const handleVenueInfo = () => {
    const currentVenue = venues[currentIndex];
    Alert.alert(
      currentVenue.name,
      `${currentVenue.description}\n\nAddress: ${currentVenue.address}\nRating: ${currentVenue.rating}/5\nPrice: ${'$'.repeat(currentVenue.priceLevel || 1)}`,
      [{ text: 'Close' }]
    );
  };

  const handleSessionComplete = () => {
    Alert.alert(
      'Discovery Complete!',
      `You've explored all venues in this session. ${state.likedVenues.length} venues liked.`,
      [
        { text: 'New Session', onPress: startNewDiscoverySession },
        { text: 'View Likes', onPress: () => router.push('/(tabs)/likes') },
        { text: 'Go Home', onPress: () => router.push('/(tabs)') }
      ]
    );
  };

  const handleResumeSession = () => {
    if (state.discoverySession && state.discoverySession.venues.length > 0) {
      setVenues(state.discoverySession.venues);
      setCurrentIndex(state.discoverySession.currentIndex);
      setSessionActive(true);
    }
  };

  const handleCustomDiscovery = () => {
    // Navigate to InstaPlan instead
    router.push('/instaplan');
  };

  const handleQuickStart = () => {
    if (!state.currentLocation) {
      // Go to location setup first
      router.push('/location-select');
    } else {
      // Go directly to vibe selection if location is already set
      router.push('/onboarding/quickvibe');
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Check if there's an active session that can be resumed
  const hasResumableSession = state.discoverySession && 
    state.discoverySession.venues.length > 0 && 
    state.discoverySession.currentIndex < state.discoverySession.venues.length &&
    !sessionActive;

  // If we have an active session, show the discovery interface
  if (sessionActive && venues.length > 0 && currentIndex < venues.length) {
    const currentVenue = venues[currentIndex];
    const progress = ((currentIndex + 1) / venues.length) * 100;

    return (
      <View style={styles.discoveryContainer}>
        {/* Header with progress */}
        <View style={styles.discoveryHeader}>
          <View style={styles.discoveryHeaderTop}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => setSessionActive(false)}
            >
              <Compass color="#111827" size={20} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.discoveryTitle}>Discovering</Text>
              <Text style={styles.discoverySubtitle}>
                {currentIndex + 1} of {venues.length}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={toggleFilters}
            >
              <Filter color="#111827" size={20} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* Weather info */}
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherText}>
              {weatherCondition.temperature}° • {weatherCondition.condition}
              {weatherCondition.isRaining && ' • Indoor venues recommended'}
            </Text>
          </View>
        </View>

        {/* Swipe card */}
        <View style={styles.cardContainer}>
          <SwipeCard
            venue={currentVenue}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onInfo={handleVenueInfo}
            showMatchScore={true}
          />
        </View>

        {/* Distance filter (when filters are shown) */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterCard}>
              <Text style={styles.filterTitle}>Distance: {distanceFilter} miles</Text>
              <View style={styles.distanceButtons}>
                {[1, 2, 5, 10].map(distance => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceButton,
                      distanceFilter === distance && styles.distanceButtonActive
                    ]}
                    onPress={() => setDistanceFilter(distance)}
                  >
                    <Text style={[
                      styles.distanceButtonText,
                      distanceFilter === distance && styles.distanceButtonTextActive
                    ]}>
                      {distance}mi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '764ba2']}
          style={styles.loadingContainer}
        >
          <Sparkles color="#FFFFFF" size={48} />
          <Text style={styles.loadingText}>Finding amazing venues...</Text>
          <Text style={styles.loadingSubtext}>
            Considering weather: {weatherCondition.condition}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Main discovery screen (entry point)
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Compass color="#FFFFFF" size={32} />
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your next adventure</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Samuel Sauntr Widget */}
        <SamuelSauntrWidget 
          location={state.currentLocation?.address}
          onLocationPress={() => router.push('/onboarding/location')}
          context="discovery"
        />

        {/* Resume session card */}
        {hasResumableSession && (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={handleResumeSession}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.resumeGradient}
            >
              <View style={styles.resumeContent}>
                <View style={styles.resumeIcon}>
                  <Play color="#FFFFFF" size={24} />
                </View>
                <View style={styles.resumeText}>
                  <Text style={styles.resumeTitle}>Resume Discovery</Text>
                  <Text style={styles.resumeSubtitle}>
                    Continue from venue {(state.discoverySession?.currentIndex || 0) + 1} of {state.discoverySession?.venues.length || 0}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick start card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleQuickStart}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#ff6b6b', '#ee5a24']}
            style={styles.cardGradient}
          >
            <View style={styles.cardIcon}>
              <Zap color="#FFFFFF" size={28} />
            </View>
            <Text style={styles.cardTitle}>Quick Start</Text>
            <Text style={styles.cardSubtitle}>
              Choose your vibe and start discovering
            </Text>
            <View style={styles.cardBadge}>
              <Text style={styles.badgeText}>INSTANT</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Custom discovery card */}
        <TouchableOpacity
          style={[styles.optionCard, styles.customCard]}
          onPress={handleCustomDiscovery}
          activeOpacity={0.9}
        >
          <View style={styles.customCardContent}>
            <View style={styles.cardIcon}>
              <Zap color="#8B5CF6" size={28} />
            </View>
            <Text style={styles.customCardTitle}>InstaPlan</Text>
            <Text style={styles.customCardSubtitle}>
              AI-generated 2-3 hour itinerary with perfect venues
            </Text>
            <View style={[styles.cardBadge, styles.customBadge]}>
              <Text style={[styles.badgeText, styles.customBadgeText]}>INSTANT</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Start new session button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={startNewDiscoverySession}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.startGradient}
          >
            <Sparkles color="#FFFFFF" size={20} />
            <Text style={styles.startButtonText}>Start New Session</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.likedVenues.length}</Text>
            <Text style={styles.statLabel}>Liked Venues</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.user?.totalAdventures || 0}</Text>
            <Text style={styles.statLabel}>Adventures</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.currentLocation?.radius || distanceFilter}</Text>
            <Text style={styles.statLabel}>Mile Radius</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  discoveryContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
  },
  subtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  discoveryHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  discoveryHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  discoverySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 1,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  distanceButtonActive: {
    backgroundColor: '#3B82F6',
  },
  distanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  distanceButtonTextActive: {
    color: '#FFFFFF',
  },
  resumeCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  resumeGradient: {
    padding: 18,
  },
  resumeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resumeText: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  resumeSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  optionCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    height: 140,
  },
  customCard: {
    backgroundColor: '#FFFFFF',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  customCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  customCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 6,
    textAlign: 'center',
  },
  customCardSubtitle: {
    fontSize: 13,
    color: '#717171',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  cardBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  customBadge: {
    backgroundColor: '#EBF4FF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  customBadgeText: {
    color: '#3B82F6',
  },
  startButton: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#717171',
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 14,
  },
});