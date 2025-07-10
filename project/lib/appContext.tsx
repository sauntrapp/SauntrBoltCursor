import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, DiscoverySession, Venue, WeatherData } from './types';
import { userService } from './userService';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  addLikedVenue: (venue: Venue) => Promise<void>;
  removeLikedVenue: (venueId: string) => Promise<void>;
  clearLikedVenues: () => Promise<void>;
  setDiscoverySession: (session: DiscoverySession | null) => Promise<void>;
  setCurrentLocation: (location: { address: string; coordinates: string; lat: number; lng: number; radius?: number } | null) => Promise<void>;
  setWeatherData: (weather: WeatherData | null) => Promise<void>;
  loadSauntrToMap: (venues: Venue[]) => Promise<void>;
  deleteSauntr: (sauntrId: string) => Promise<void>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_DISCOVERY_SESSION'; payload: DiscoverySession | null }
  | { type: 'SET_LIKED_VENUES'; payload: Venue[] }
  | { type: 'ADD_LIKED_VENUE'; payload: Venue }
  | { type: 'REMOVE_LIKED_VENUE'; payload: string }
  | { type: 'CLEAR_LIKED_VENUES' }
  | { type: 'SET_CURRENT_LOCATION'; payload: { address: string; coordinates: string; lat: number; lng: number; radius?: number } | null }
  | { type: 'SET_WEATHER_DATA'; payload: WeatherData | null }
  | { type: 'DELETE_SAUNTR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  discoverySession: null,
  likedVenues: [],
  currentLocation: null,
  weatherData: null,
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case 'SET_DISCOVERY_SESSION':
      return {
        ...state,
        discoverySession: action.payload,
      };
    case 'SET_LIKED_VENUES':
      return {
        ...state,
        likedVenues: action.payload,
      };
    case 'ADD_LIKED_VENUE':
      // Check if venue already exists to prevent duplicates
      const venueExists = state.likedVenues.some(venue => venue.id === action.payload.id);
      if (venueExists) {
        return state;
      }
      return {
        ...state,
        likedVenues: [...state.likedVenues, action.payload],
      };
    case 'REMOVE_LIKED_VENUE':
      return {
        ...state,
        likedVenues: state.likedVenues.filter(venue => venue.id !== action.payload),
      };
    case 'CLEAR_LIKED_VENUES':
      return {
        ...state,
        likedVenues: [],
      };
    case 'SET_CURRENT_LOCATION':
      return {
        ...state,
        currentLocation: action.payload,
      };
    case 'SET_WEATHER_DATA':
      return {
        ...state,
        weatherData: action.payload,
      };
    case 'DELETE_SAUNTR':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          savedSauntrs: state.user.savedSauntrs.filter(sauntr => sauntr.id !== action.payload)
        } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on app start
  useEffect(() => {
    let isMounted = true;
    
    // Add a small delay to ensure the app is ready
    const timer = setTimeout(() => {
      if (isMounted) {
        loadPersistedData();
      }
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    
    async function loadPersistedData() {
      try {
        if (!isMounted) return;
        dispatch({ type: 'SET_LOADING', payload: true });

        // Load user from storage/auth
        const user = await userService.getCurrentUser();
        if (user && isMounted) {
          dispatch({ type: 'SET_USER', payload: user });
        }

        // Load discovery session
        const sessionData = await AsyncStorage.getItem('discoverySession');
        if (sessionData && isMounted) {
          const session: DiscoverySession = JSON.parse(sessionData);
          dispatch({ type: 'SET_DISCOVERY_SESSION', payload: session });
        }

        // Load liked venues
        const likedVenuesData = await AsyncStorage.getItem('likedVenues');
        if (likedVenuesData && isMounted) {
          const venues: Venue[] = JSON.parse(likedVenuesData);
          dispatch({ type: 'SET_LIKED_VENUES', payload: venues });
        }

        // Load current location
        const locationData = await AsyncStorage.getItem('currentLocation');
        if (locationData && isMounted) {
          const location = JSON.parse(locationData);
          dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });
        }

      } catch (error) {
        console.error('Error loading persisted data:', error);
      } finally {
        if (isMounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    }
  }, []);


  // Centralized persistence for likedVenues
  useEffect(() => {
    // Only persist after initial loading is complete
    if (!state.isLoading) {
      AsyncStorage.setItem('likedVenues', JSON.stringify(state.likedVenues));
    }
  }, [state.likedVenues, state.isLoading]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { user, error } = await userService.signIn(email, password);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      await userService.trackActivity('sign_in');
    }
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string): Promise<{ error: string | null }> => {
    const { user, error } = await userService.signUp(email, password, name);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      await userService.trackActivity('sign_up');
    }
    return { error };
  }, []);

  const signOut = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await userService.signOut();
    if (!error) {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'CLEAR_LIKED_VENUES' });
      dispatch({ type: 'SET_DISCOVERY_SESSION', payload: null });
    }
    return { error };
  }, []);

  const addLikedVenue = useCallback(async (venue: Venue): Promise<void> => {
    dispatch({ type: 'ADD_LIKED_VENUE', payload: venue });
    await userService.trackActivity('like_venue', venue.id, venue.name, venue.address);
  }, []);

  const removeLikedVenue = useCallback(async (venueId: string): Promise<void> => {
    dispatch({ type: 'REMOVE_LIKED_VENUE', payload: venueId });
    await userService.trackActivity('unlike_venue', venueId);
  }, []);

  const clearLikedVenues = useCallback(async (): Promise<void> => {
    dispatch({ type: 'CLEAR_LIKED_VENUES' });
    // Immediately clear from storage as well
    await AsyncStorage.removeItem('likedVenues');
  }, []);

  const setDiscoverySession = useCallback(async (session: DiscoverySession | null): Promise<void> => {
    dispatch({ type: 'SET_DISCOVERY_SESSION', payload: session });
    if (session) {
      await AsyncStorage.setItem('discoverySession', JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem('discoverySession');
    }
  }, []);

  const setCurrentLocation = useCallback(async (location: { address: string; coordinates: string; lat: number; lng: number; radius?: number } | null): Promise<void> => {
    dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });
    if (location) {
      await AsyncStorage.setItem('currentLocation', JSON.stringify(location));
      console.log('Location set:', location); // Debug log
    } else {
      await AsyncStorage.removeItem('currentLocation');
    }
  }, []);

  const setWeatherData = useCallback(async (weather: WeatherData | null): Promise<void> => {
    dispatch({ type: 'SET_WEATHER_DATA', payload: weather });
  }, []);

  const loadSauntrToMap = useCallback(async (venues: Venue[]): Promise<void> => {
    // Replace current liked venues with sauntr venues
    dispatch({ type: 'SET_LIKED_VENUES', payload: venues });
    
    // Track activity
    await userService.trackActivity('load_sauntr_to_map', undefined, undefined, undefined, { venueCount: venues.length });
  }, []);

  const deleteSauntr = useCallback(async (sauntrId: string): Promise<void> => {
    try {
      const { error } = await userService.deleteSauntr(sauntrId);
      if (!error) {
        dispatch({ type: 'DELETE_SAUNTR', payload: sauntrId });
      } else {
        throw new Error(error);
      }
    } catch (error) {
      console.error('Failed to delete sauntr:', error);
      throw error;
    }
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    signIn,
    signUp,
    signOut,
    addLikedVenue,
    removeLikedVenue,
    clearLikedVenues,
    setDiscoverySession,
    setCurrentLocation,
    setWeatherData,
    loadSauntrToMap,
    deleteSauntr,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}