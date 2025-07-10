import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Venue } from '@/lib/types';
import { MapPin, Heart, Zap, Navigation, ExternalLink, X, Clock, Users, Star, Phone, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateDistance, formatDistance } from '@/lib/mapUtils';

const { width, height } = Dimensions.get('window');

interface SauntrMapViewProps {
  venues: Venue[];
  onVenuePress?: (venue: Venue) => void;
  showUserLocation?: boolean;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMapStyleChange?: (style: 'street' | 'satellite' | 'dark') => void;
  onFitToVenues?: () => void;
  onGenerateInstaPlan?: () => void;
  onShareMap?: () => void;
}

interface VenueMarker {
  venue: Venue;
  index: number;
  type: 'liked' | 'instaplan';
  isSelected: boolean;
}

export default function SauntrMapView({ 
  venues, 
  onVenuePress, 
  showUserLocation = true,
  region,
  onMapStyleChange,
  onFitToVenues,
  onGenerateInstaPlan,
  onShareMap
}: SauntrMapViewProps) {
  const [mapReady, setMapReady] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'dark'>('street');
  const [showToolbar, setShowToolbar] = useState(true);
  const [instaPlanActive, setInstaPlanActive] = useState(false);
  const [routeSequence, setRouteSequence] = useState<Venue[]>([]);

  // Convert venues to markers with enhanced data
  const markers: VenueMarker[] = venues.map((venue, index) => ({
    venue,
    index: index + 1,
    type: venue.isInstaPlan ? 'instaplan' : 'liked',
    isSelected: selectedVenue?.id === venue.id
  }));

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkerPress = (venue: Venue) => {
    setSelectedVenue(venue);
    onVenuePress?.(venue);
  };

  const handleCloseVenuePopup = () => {
    setSelectedVenue(null);
  };

  const handleMapStyleChange = (newStyle: 'street' | 'satellite' | 'dark') => {
    setMapStyle(newStyle);
    onMapStyleChange?.(newStyle);
  };

  const handleGenerateInstaPlan = () => {
    if (venues.length < 3) {
      Alert.alert(
        'Need More Venues',
        'Generate an InstaPlan with at least 3 liked venues for the best experience.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Simulate InstaPlan generation
    const shuffled = [...venues].sort(() => Math.random() - 0.5);
    const sequence = shuffled.slice(0, 3);
    setRouteSequence(sequence);
    setInstaPlanActive(true);
    onGenerateInstaPlan?.();
  };

  const handleDirections = (venue: Venue) => {
    Alert.alert(
      'Directions',
      `Get directions to ${venue.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => {
          // This would integrate with the existing mapUtils.openDirections
          Alert.alert('Directions', 'Opening in maps app...');
        }}
      ]
    );
  };

  const handleCallVenue = (venue: Venue) => {
    Alert.alert(
      'Call Venue',
      `Call ${venue.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          Alert.alert('Call', 'Opening phone app...');
        }}
      ]
    );
  };

  const handleVisitWebsite = (venue: Venue) => {
    Alert.alert(
      'Visit Website',
      `Visit ${venue.name} website?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          Alert.alert('Website', 'Opening website...');
        }}
      ]
    );
  };

  const handleFitToVenues = () => {
    Alert.alert('Fit to Venues', 'Map will zoom to show all your venues');
  };

  // Default region if none provided
  const defaultRegion = region || {
    latitude: venues.length > 0 ? venues[0].latitude : 40.7589,
    longitude: venues.length > 0 ? venues[0].longitude : -73.9851,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Web implementation with enhanced features
  return (
    <View style={styles.container}>
      <View style={[
        styles.webMapContainer,
        mapStyle === 'dark' && styles.darkMapContainer,
        mapStyle === 'satellite' && styles.satelliteMapContainer
      ]}>
        {/* Map Background with realistic styling */}
        <View style={[
          styles.webMapPlaceholder,
          mapStyle === 'dark' && styles.darkMapStyle,
          mapStyle === 'satellite' && styles.satelliteMapStyle
        ]}>
          {/* Map Grid Pattern */}
          <View style={styles.mapGrid}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>
          
          {/* Map Controls */}
          <View style={styles.mapControls}>
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton}>
                <Text style={styles.zoomText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Map Title */}
          <View style={styles.mapTitleContainer}>
            <Text style={[styles.mapTitle, mapStyle === 'dark' && styles.darkText]}>
              Interactive Map
            </Text>
            <Text style={[styles.mapSubtitle, mapStyle === 'dark' && styles.darkSubtext]}>
              {venues.length} venue{venues.length !== 1 ? 's' : ''} displayed
            </Text>
          </View>
          
          {!mapReady && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}
        </View>
        
        {/* Enhanced Venue Markers */}
        {mapReady && markers.map((marker) => (
          <TouchableOpacity
            key={marker.venue.id}
            style={[
              styles.webMarker,
              {
                left: `${20 + (marker.index * 15) % 60}%`,
                top: `${30 + (marker.index * 10) % 40}%`,
              },
              marker.isSelected && styles.selectedMarker
            ]}
            onPress={() => handleMarkerPress(marker.venue)}
          >
            <View style={[
              styles.markerPin,
              marker.type === 'instaplan' && styles.instaplanMarker,
              marker.isSelected && styles.selectedMarkerPin
            ]}>
              {marker.type === 'instaplan' ? (
                <Zap color="#8B5CF6" size={16} />
              ) : (
                <Heart color="#10B981" size={16} />
              )}
              <Text style={[
                styles.markerText,
                marker.type === 'instaplan' && styles.instaplanMarkerText
              ]}>
                {marker.index}
              </Text>
            </View>
            <Text style={styles.markerLabel} numberOfLines={1}>
              {marker.venue.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Route Lines for InstaPlan */}
        {instaPlanActive && routeSequence.length > 1 && (
          <View style={styles.routeOverlay}>
            {routeSequence.map((venue, index) => {
              if (index === routeSequence.length - 1) return null;
              const nextVenue = routeSequence[index + 1];
              return (
                <View
                  key={`route-${index}`}
                  style={[
                    styles.routeLine,
                    {
                      left: `${25 + (index * 15) % 60}%`,
                      top: `${35 + (index * 10) % 40}%`,
                      width: 60,
                      height: 2,
                      transform: [{ rotate: '45deg' }]
                    }
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Floating Weather Widget */}
      <View style={styles.weatherWidget}>
        <View style={styles.weatherContent}>
          <Text style={styles.weatherTemp}>72°F</Text>
          <Text style={styles.weatherCondition}>Partly Cloudy</Text>
        </View>
      </View>

      {/* Floating Toolbar */}
      {showToolbar && (
        <View style={styles.toolbar}>
          <TouchableOpacity 
            style={styles.toolbarButton}
            onPress={() => handleMapStyleChange('street')}
          >
            <Text style={[styles.toolbarText, mapStyle === 'street' && styles.activeToolbarText]}>
              Street
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.toolbarButton}
            onPress={() => handleMapStyleChange('satellite')}
          >
            <Text style={[styles.toolbarText, mapStyle === 'satellite' && styles.activeToolbarText]}>
              Satellite
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.toolbarButton}
            onPress={() => handleMapStyleChange('dark')}
          >
            <Text style={[styles.toolbarText, mapStyle === 'dark' && styles.activeToolbarText]}>
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Buttons */}
      <View style={styles.floatingActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleFitToVenues}
        >
          <Text style={styles.actionButtonText}>Fit to Venues</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.instaPlanButton]}
          onPress={handleGenerateInstaPlan}
        >
          <Zap color="#FFFFFF" size={16} />
          <Text style={styles.actionButtonText}>InstaPlan</Text>
        </TouchableOpacity>
      </View>

      {/* Venue Carousel */}
      <View style={styles.carouselContainer}>
        <View style={styles.carouselHeader}>
          <Text style={styles.carouselTitle}>Your Venues</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {markers.map((marker) => (
            <TouchableOpacity
              key={marker.venue.id}
              style={[
                styles.carouselCard,
                marker.isSelected && styles.selectedCarouselCard
              ]}
              onPress={() => handleMarkerPress(marker.venue)}
            >
              <View style={styles.carouselCardHeader}>
                <View style={[
                  styles.carouselMarker,
                  marker.type === 'instaplan' && styles.instaplanCarouselMarker
                ]}>
                  {marker.type === 'instaplan' ? (
                    <Zap color="#8B5CF6" size={12} />
                  ) : (
                    <Heart color="#10B981" size={12} />
                  )}
                </View>
                <Text style={styles.carouselCardTitle} numberOfLines={1}>
                  {marker.venue.name}
                </Text>
              </View>
              <Text style={styles.carouselCardAddress} numberOfLines={1}>
                {marker.venue.address}
              </Text>
              <View style={styles.carouselCardActions}>
                <TouchableOpacity
                  style={styles.carouselActionButton}
                  onPress={() => handleDirections(marker.venue)}
                >
                  <Navigation color="#3B82F6" size={12} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Venue Detail Popup */}
      <Modal
        visible={selectedVenue !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseVenuePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.venuePopup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>{selectedVenue?.name}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseVenuePopup}
              >
                <X color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.popupContent}>
              <View style={styles.venueInfo}>
                <View style={styles.venueRating}>
                  <Star color="#F59E0B" size={16} />
                  <Text style={styles.ratingText}>{selectedVenue?.rating}/5</Text>
                </View>
                <Text style={styles.venueAddress}>{selectedVenue?.address}</Text>
                <Text style={styles.venueDescription}>{selectedVenue?.description}</Text>
              </View>
              
              <View style={styles.popupActions}>
                <TouchableOpacity 
                  style={styles.popupActionButton}
                  onPress={() => selectedVenue && handleDirections(selectedVenue)}
                >
                  <Navigation color="#3B82F6" size={16} />
                  <Text style={styles.popupActionText}>Directions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.popupActionButton}
                  onPress={() => selectedVenue && handleCallVenue(selectedVenue)}
                >
                  <Phone color="#10B981" size={16} />
                  <Text style={styles.popupActionText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.popupActionButton}
                  onPress={() => selectedVenue && handleVisitWebsite(selectedVenue)}
                >
                  <Globe color="#8B5CF6" size={16} />
                  <Text style={styles.popupActionText}>Website</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  webMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  darkMapContainer: {
    backgroundColor: '#1F2937',
  },
  satelliteMapContainer: {
    backgroundColor: '#374151',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    position: 'relative',
    padding: 20,
  },
  darkMapStyle: {
    backgroundColor: '#1F2937',
  },
  satelliteMapStyle: {
    backgroundColor: '#374151',
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#D1D5DB',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  webMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instaplanMarker: {
    borderColor: '#8B5CF6',
  },
  selectedMarker: {
    zIndex: 10,
  },
  selectedMarkerPin: {
    borderColor: '#3B82F6',
    borderWidth: 3,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  instaplanMarkerText: {
    color: '#8B5CF6',
  },
  markerLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80,
  },
  routeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  routeLine: {
    backgroundColor: '#8B5CF6',
    opacity: 0.6,
    borderRadius: 1,
  },
  weatherWidget: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherContent: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  weatherCondition: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  toolbar: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginVertical: 2,
  },
  toolbarText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeToolbarText: {
    color: '#3B82F6',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instaPlanButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  carousel: {
    gap: 12,
  },
  carouselCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCarouselCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  carouselCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  carouselMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  instaplanCarouselMarker: {
    backgroundColor: '#8B5CF6',
  },
  carouselCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  carouselCardAddress: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  carouselCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  carouselActionButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  venuePopup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  popupContent: {
    padding: 20,
  },
  venueInfo: {
    marginBottom: 16,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  venueDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  popupActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  popupActionButton: {
    alignItems: 'center',
    padding: 8,
  },
  popupActionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  gridLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomControls: {
    flexDirection: 'column',
    gap: 4,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  zoomText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  mapTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});