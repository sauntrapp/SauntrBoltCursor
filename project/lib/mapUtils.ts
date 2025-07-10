import { Platform, Linking } from 'react-native';
import { Venue } from './types';
import { GOOGLE_MAPS_API_KEY } from './config';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapBounds {
  northEast: { latitude: number; longitude: number };
  southWest: { latitude: number; longitude: number };
}

/**
 * Calculate the region that encompasses all venues
 */
export function calculateMapRegion(venues: Venue[], padding: number = 0.01): MapRegion {
  if (venues.length === 0) {
    // Default to NYC if no venues
    return {
      latitude: 40.7589,
      longitude: -73.9851,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  if (venues.length === 1) {
    // Single venue - center on it with reasonable zoom
    return {
      latitude: venues[0].latitude,
      longitude: venues[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  // Multiple venues - calculate bounds
  const latitudes = venues.map(v => v.latitude);
  const longitudes = venues.map(v => v.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const latDelta = Math.max(maxLat - minLat + padding, 0.01);
  const lngDelta = Math.max(maxLng - minLng + padding, 0.01);

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/**
 * Calculate distance between two coordinates in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return '< 0.1 mi';
  } else if (miles < 1) {
    return `${miles.toFixed(1)} mi`;
  } else {
    return `${miles.toFixed(1)} mi`;
  }
}

/**
 * Get map URL for web implementation
 */
export function getMapUrl(venues: Venue[]): string {
  if (Platform.OS !== 'web') {
    return '';
  }

  const region = calculateMapRegion(venues);
  const markers = venues.map((venue, index) => 
    `markers=color:blue%7Clabel:${index + 1}%7C${venue.latitude},${venue.longitude}`
  ).join('&');

  return `https://maps.googleapis.com/maps/api/staticmap?center=${region.latitude},${region.longitude}&zoom=14&size=600x400&${markers}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Open venue in external maps app
 */
export function openInMaps(venue: Venue): void {
  const { latitude, longitude, name } = venue;
  
  if (Platform.OS === 'ios') {
    const url = `maps:0,0?q=${encodeURIComponent(name)}@${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web
      const webUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;
      Linking.openURL(webUrl);
    });
  } else if (Platform.OS === 'android') {
    const url = `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(name)})`;
    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(webUrl);
    });
  } else {
    // Web fallback
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
}

/**
 * Generate directions URL
 */
export function getDirectionsUrl(
  venue: Venue, 
  userLocation?: { lat: number; lng: number } | null
): string {
  const { latitude, longitude } = venue;
  
  if (Platform.OS === 'web') {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const destination = `${latitude},${longitude}`;
    return `https://www.google.com/maps/dir/${origin}/${destination}`;
  }
  
  // For mobile, return appropriate deep link
  if (Platform.OS === 'ios') {
    const origin = userLocation ? `saddr=${userLocation.lat},${userLocation.lng}&` : '';
    return `maps:?${origin}daddr=${latitude},${longitude}&dirflg=d`;
  } else {
    return `google.navigation:q=${latitude},${longitude}`;
  }
}

/**
 * Open directions in external maps app
 */
export function openDirections(
  venue: Venue, 
  userLocation?: { lat: number; lng: number } | null
): void {
  const directionsUrl = getDirectionsUrl(venue, userLocation);
  
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(directionsUrl, '_blank');
    }
  } else {
    Linking.openURL(directionsUrl).catch((error) => {
      console.error('Failed to open directions:', error);
      // Fallback to opening in maps
      openInMaps(venue);
    });
  }
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Get venue type color for markers
 */
export function getVenueTypeColor(venueType: string): string {
  switch (venueType) {
    case 'food':
      return '#10B981'; // Green
    case 'social':
      return '#8B5CF6'; // Purple
    case 'activity':
      return '#F59E0B'; // Orange
    default:
      return '#3B82F6'; // Blue
  }
}

/**
 * Calculate optimal zoom level for venues
 */
export function calculateOptimalZoom(venues: Venue[]): number {
  if (venues.length === 0) return 14;
  if (venues.length === 1) return 16;
  
  const region = calculateMapRegion(venues);
  const latDelta = region.latitudeDelta;
  const lngDelta = region.longitudeDelta;
  
  // Convert delta to zoom level
  const maxDelta = Math.max(latDelta, lngDelta);
  return Math.floor(16 - Math.log2(maxDelta * 100));
}