export interface Venue {
  id: string;
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  priceLevel?: number;
  image?: string;
  photos?: string[];
  categories?: string[];
  venueType: "food" | "social" | "activity";
  openNow?: boolean;
  distance?: string;
  phone?: string;
  website?: string;
  description?: string;
  matchScore?: number;
  weatherSuitability?: "indoor" | "outdoor" | "both";
  reviews?: Review[];
  reviewCount?: number;
  isInstaPlan?: boolean;
}

export interface InstaPlan {
  id: string;
  title: string;
  description: string;
  venues: Venue[];
  venueRoles: string[];
  venueNotes?: string[];
  estimatedDuration: string;
  totalDistance: string;
  timeOfDay: string;
  weatherNote?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
  helpful?: number;
}

export interface UserPreferences {
  vibes: string[];
  venueTypes: string[];
  cuisinePreferences: string[];
  activityPreferences: string[];
  budgetRange: [number, number];
  ratingThreshold: number;
  maxDistance: number;
  specialFeatures: string[];
}

export interface SavedSauntr {
  id: string;
  title: string;
  description: string;
  venues: Venue[];
  createdAt: string;
  colorTheme: "green" | "purple" | "blue" | "orange";
  venueCount: number;
  previewVenues: string[];
}

export interface DiscoverySession {
  type: "surprise" | "custom";
  venues: Venue[];
  currentIndex: number;
  selectedVibes?: string[];
  userPreferences?: UserPreferences;
  selectedLocation: { address: string; coordinates: string; lat: number; lng: number; radius?: number } | null;
  distance?: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  isRaining: boolean;
  humidity: number;
  windSpeed: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  lastActive: string;
  savedSauntrs: SavedSauntr[];
  totalVisits: number;
  totalAdventures: number;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  discoverySession: DiscoverySession | null;
  likedVenues: Venue[];
  currentLocation: { address: string; coordinates: string; lat: number; lng: number; radius?: number } | null;
  weatherData: WeatherData | null;
  isLoading: boolean;
}

export const VIBES = [
  { id: 'chill', name: 'Chill & Relaxed', emoji: '😌' },
  { id: 'energy', name: 'High Energy', emoji: '⚡' },
  { id: 'romantic', name: 'Romantic', emoji: '💕' },
  { id: 'social', name: 'Social & Fun', emoji: '🎉' },
  { id: 'cultural', name: 'Cultural', emoji: '🎭' },
  { id: 'foodie', name: 'Foodie Paradise', emoji: '🍽️' },
  { id: 'nightlife', name: 'Nightlife', emoji: '🌙' },
  { id: 'outdoor', name: 'Outdoor Vibes', emoji: '🌳' },
];

export const CUISINE_TYPES = [
  'Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 
  'Indian', 'Japanese', 'Thai', 'French', 'Chinese', 'Korean', 'Vietnamese'
];

export const VENUE_TYPES = [
  { id: 'food', name: 'Food & Dining', emoji: '🍽️' },
  { id: 'social', name: 'Social & Bars', emoji: '🍻' },
  { id: 'activity', name: 'Activities & Fun', emoji: '🎯' },
];

export const ACTIVITY_TYPES = [
  'Museum', 'Park', 'Shopping', 'Entertainment', 'Sports', 'Art', 'Music', 'Theater'
];

export const SPECIAL_FEATURES = [
  'Outdoor Seating', 'Romantic Atmosphere', 'Quiet Environment', 'Good for Groups',
  'Live Music', 'Happy Hour', 'Rooftop', 'Waterfront', 'Pet Friendly', 'Late Night'
];

export const COLOR_THEMES = [
  { id: 'green', name: 'Green', color: '#22c55e' },
  { id: 'purple', name: 'Purple', color: '#8b5cf6' },
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
  { id: 'orange', name: 'Orange', color: '#f97316' },
];