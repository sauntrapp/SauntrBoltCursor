import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Venue } from '@/lib/types';
import { MapPin, Heart, Zap, Navigation, ExternalLink, X, Clock, Users, Star, Phone, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateDistance, formatDistance } from '@/lib/mapUtils';

// Conditionally import MapView only for native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const MapViewModule = require('react-native-maps');
    MapView = MapViewModule.default;
    Marker = MapViewModule.Marker;
    PROVIDER_GOOGLE = MapViewModule.PROVIDER_GOOGLE;
    Polyline = MapViewModule.Polyline;
  } catch (error) {
    console.log('react-native-maps not available on web');
  }
}

interface VenueMapProps {
  venues: Venue[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedVenue: Venue | null;
  onVenueSelect: (venue: Venue) => void;
  onClose: () => void;
  showDirections?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function VenueMap({ 
  venues, 
  userLocation, 
  selectedVenue, 
  onVenueSelect, 
  onClose,
  showDirections = false 
}: VenueMapProps) {
  const [region, setRegion] = useState({
    latitude: userLocation?.latitude || 37.7749,
    longitude: userLocation?.longitude || -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedVenue && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedVenue.latitude,
        longitude: selectedVenue.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [selectedVenue]);

  const handleMarkerPress = (venue: Venue) => {
    onVenueSelect(venue);
  };

  const getMarkerColor = (venue: Venue) => {
    if (venue.id === selectedVenue?.id) return '#FF6B6B';
    if (venue.isLiked) return '#4ECDC4';
    return '#95A5A6';
  };

  const openDirections = () => {
    if (!selectedVenue || !userLocation) return;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${selectedVenue.latitude},${selectedVenue.longitude}`,
      android: `geo:0,0?q=${selectedVenue.latitude},${selectedVenue.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.latitude},${selectedVenue.longitude}`
    });
    
    if (url) {
      Alert.alert(
        'Open Directions',
        'This will open your default maps app',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => {
            // In a real app, you'd use Linking.openURL(url)
            console.log('Opening directions to:', selectedVenue.name);
          }}
        ]
      );
    }
  };

  // Real Google Maps implementation
  if (Platform.OS !== 'web' && MapView) {
    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {venues.map((venue) => (
            <Marker
              key={venue.id}
              coordinate={{
                latitude: venue.latitude,
                longitude: venue.longitude,
              }}
              title={venue.name}
              description={venue.description}
              pinColor={getMarkerColor(venue)}
              onPress={() => handleMarkerPress(venue)}
            />
          ))}
          
          {showDirections && selectedVenue && userLocation && (
            <Polyline
              coordinates={[
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: selectedVenue.latitude, longitude: selectedVenue.longitude }
              ]}
              strokeColor="#4ECDC4"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {selectedVenue && (
          <View style={styles.venueCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{selectedVenue.name}</Text>
                  <View style={styles.venueDetails}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.venueAddress}>{selectedVenue.address}</Text>
                  </View>
                  {userLocation && (
                    <View style={styles.venueDetails}>
                      <Navigation size={14} color="#666" />
                      <Text style={styles.venueDistance}>
                        {formatDistance(calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          selectedVenue.latitude,
                          selectedVenue.longitude
                        ))}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.heartButton, selectedVenue.isLiked && styles.heartButtonLiked]}
                  onPress={() => {
                    // Toggle like functionality would go here
                    console.log('Toggle like for:', selectedVenue.name);
                  }}
                >
                  <Heart 
                    size={20} 
                    color={selectedVenue.isLiked ? "#FFFFFF" : "#FF6B6B"} 
                    fill={selectedVenue.isLiked ? "#FFFFFF" : "transparent"}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={openDirections}>
                  <Navigation size={18} color="#4ECDC4" />
                  <Text style={styles.actionText}>Directions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    // View details functionality
                    console.log('View details for:', selectedVenue.name);
                  }}
                >
                  <ExternalLink size={18} color="#4ECDC4" />
                  <Text style={styles.actionText}>Details</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  }

  // Web fallback - Simple list view
  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.webContainer}>
        <View style={styles.webHeader}>
          <Text style={styles.webTitle}>Venue Locations</Text>
          <TouchableOpacity onPress={onClose} style={styles.webCloseButton}>
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.webContent}>
          <Text style={styles.webSubtitle}>
            Map view is not available on web. Here are the venue locations:
          </Text>
          
          {venues.map((venue) => (
            <TouchableOpacity
              key={venue.id}
              style={[
                styles.webVenueItem,
                selectedVenue?.id === venue.id && styles.webVenueItemSelected
              ]}
              onPress={() => onVenueSelect(venue)}
            >
              <View style={styles.webVenueHeader}>
                <Text style={styles.webVenueName}>{venue.name}</Text>
                <View style={styles.webVenueRating}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.webRatingText}>{venue.rating}</Text>
                </View>
              </View>
              
              <View style={styles.webVenueDetails}>
                <View style={styles.webDetailRow}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.webDetailText}>{venue.address}</Text>
                </View>
                
                {userLocation && (
                  <View style={styles.webDetailRow}>
                    <Navigation size={14} color="#666" />
                    <Text style={styles.webDetailText}>
                      {formatDistance(calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        venue.latitude,
                        venue.longitude
                      ))}
                    </Text>
                  </View>
                )}
                
                <View style={styles.webDetailRow}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.webDetailText}>{venue.hours}</Text>
                </View>
                
                {venue.phone && (
                  <View style={styles.webDetailRow}>
                    <Phone size={14} color="#666" />
                    <Text style={styles.webDetailText}>{venue.phone}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.webVenueDescription} numberOfLines={2}>
                {venue.description}
              </Text>
              
              <View style={styles.webVenueActions}>
                <TouchableOpacity 
                  style={styles.webActionButton}
                  onPress={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;
                    console.log('Opening web directions:', url);
                  }}
                >
                  <Navigation size={16} color="#4ECDC4" />
                  <Text style={styles.webActionText}>Directions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.webActionButton}
                  onPress={() => {
                    if (venue.website) {
                      console.log('Opening website:', venue.website);
                    }
                  }}
                >
                  <Globe size={16} color="#4ECDC4" />
                  <Text style={styles.webActionText}>Website</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  venueCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  venueInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  venueDistance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  heartButtonLiked: {
    backgroundColor: '#FF6B6B',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(78,205,196,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  webCloseButton: {
    padding: 8,
  },
  webContent: {
    flex: 1,
    padding: 20,
  },
  webSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  webVenueItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  webVenueItemSelected: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  webVenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  webVenueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  webVenueRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  webVenueDetails: {
    marginBottom: 12,
  },
  webDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  webDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  webVenueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  webVenueActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  webActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(78,205,196,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  webActionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});