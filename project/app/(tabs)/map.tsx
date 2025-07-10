import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { Map, Navigation, Zap, MapPin, Clock, ArrowLeft, ExternalLink, Share2, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SauntrMapView from '@/components/MapView';
import { calculateMapRegion, openInMaps, openDirections } from '@/lib/mapUtils';
import SamuelSauntrWidget from '@/components/SamuelSauntrWidget';

export default function MapScreen() {
  const { state, loadSauntrToMap } = useApp();
  const router = useRouter();
  const likedVenues = state.likedVenues;
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'dark'>('street');
  const [showControls, setShowControls] = useState(true);

  const handleInstaPlan = () => {
    if (likedVenues.length === 0) {
      Alert.alert(
        'No Liked Venues',
        'Like some venues first to generate an InstaPlan, or start discovering!',
        [
          { text: 'Start Discovering', onPress: () => router.push('/(tabs)/discover') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    Alert.alert(
      'Generate InstaPlan',
      `Create a 2-3 hour itinerary using your ${likedVenues.length} liked venues?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            // Navigate to InstaPlan with auto-generation
            router.push('/instaplan?autoGenerate=true');
          }
        }
      ]
    );
  };

  const handleGetDirections = (venue: any) => {
    openDirections(venue, state.currentLocation);
  };

  const handleOpenInMaps = (venue: any) => {
    openInMaps(venue);
  };

  const handleVenuePress = (venue: any) => {
    Alert.alert(
      venue.name,
      venue.address,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Directions', onPress: () => handleGetDirections(venue) },
        { text: 'Open in Maps', onPress: () => handleOpenInMaps(venue) },
      ]
    );
  };

  const handleFitToVenues = () => {
    // This would trigger map to fit all venues in view
    Alert.alert('Fit to Venues', 'Map will zoom to show all your venues');
  };

  const handleShareMap = () => {
    Alert.alert(
      'Share Map',
      'Share your venue collection with friends?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          Alert.alert('Shared!', 'Your venue map has been shared');
        }}
      ]
    );
  };

  const handleMapStyleChange = (style: 'street' | 'satellite' | 'dark') => {
    setMapStyle(style);
  };

  if (likedVenues.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Map color="#FFFFFF" size={32} />
            <Text style={styles.title}>Map</Text>
            <Text style={styles.subtitle}>Your venue locations</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MapPin color="#3B82F6" size={64} />
          </View>
          <Text style={styles.emptyTitle}>No venues to show</Text>
          <Text style={styles.emptySubtitle}>
            Like some venues first to see them on the map
          </Text>
          
          <TouchableOpacity 
            style={styles.discoverButton} 
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.discoverButtonText}>Start Discovering</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const mapRegion = calculateMapRegion(likedVenues);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Map color="#FFFFFF" size={32} />
          <Text style={styles.title}>Map</Text>
          <Text style={styles.subtitle}>
            {likedVenues.length} {likedVenues.length === 1 ? 'venue' : 'venues'}
          </Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        {/* Samuel Sauntr Widget */}
        <SamuelSauntrWidget 
          location={state.currentLocation?.address}
          onLocationPress={() => router.push('/onboarding/location')}
          context="map"
        />

        {/* Enhanced Map Container */}
        <View style={styles.mapContainer}>
          <SauntrMapView
            venues={likedVenues}
            onVenuePress={handleVenuePress}
            region={mapRegion}
            showUserLocation={true}
            onMapStyleChange={handleMapStyleChange}
            onFitToVenues={handleFitToVenues}
            onGenerateInstaPlan={handleInstaPlan}
            onShareMap={handleShareMap}
          />
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowControls(!showControls)}
          >
            <Settings color="#6B7280" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleShareMap}
          >
            <Share2 color="#6B7280" size={20} />
          </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    flex: 1,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  additionalControls: {
    position: 'absolute',
    top: 100,
    right: 20,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  discoverButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});