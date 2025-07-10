import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { MapPin, Search, Navigation, ArrowLeft, Compass } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LocationSelectScreen() {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [distanceRadius, setDistanceRadius] = useState(2); // Default 2 miles
  const { setCurrentLocation } = useApp();
  const router = useRouter();

  // Simple distance options
  const distances = [1, 2, 5, 10];
  const getDistanceLabel = (distance: number) => {
    if (distance === 1) return 'Walking';
    if (distance === 2) return 'Biking';
    if (distance === 5) return 'Driving';
    return 'Exploring';
  };

  const triggerHapticFeedback = () => {
    // Haptic feedback removed for web compatibility
  };

  const requestLocationPermission = async () => {
    setIsLoading(true);
    triggerHapticFeedback();
    
    try {
      if (Platform.OS === 'web') {
        // Web fallback - use mock location
        await setCurrentLocation({
          address: 'Current Location (Web)',
          coordinates: '40.7589,-73.9851',
          lat: 40.7589,
          lng: -73.9851,
          radius: distanceRadius,
        });
        router.push('/onboarding/quickvibe');
      } else {
        // For native platforms, you would implement actual location services
        Alert.alert(
          'Location Services',
          'Location services are not available in this demo. Using default location.',
          [{ text: 'OK', onPress: () => {
            setCurrentLocation({
              address: 'New York, NY',
              coordinates: '40.7589,-73.9851',
              lat: 40.7589,
              lng: -73.9851,
              radius: distanceRadius,
            }).then(() => {
              router.push('/onboarding/quickvibe');
            });
          }}]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocation = () => {
    triggerHapticFeedback();
    
    if (searchText.trim()) {
      // Set the manual location and navigate
      const locationData = {
        address: searchText,
        coordinates: '0,0', // Placeholder
        lat: 0,
        lng: 0,
        radius: distanceRadius,
      };
      
      setCurrentLocation(locationData).then(() => {
        // Small delay to ensure state is updated, then navigate
        setTimeout(() => {
          router.push('/onboarding/quickvibe');
        }, 100);
      });
    }
  };

  const handleDistanceChange = (distance: number) => {
    setDistanceRadius(distance);
    triggerHapticFeedback();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Compass color="#FFFFFF" size={32} />
            <Text style={styles.title}>Discover Venues</Text>
            <Text style={styles.subtitle}>
              Set your location to find amazing places nearby
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Simple Distance Selector */}
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceLabel}>Search radius: {distanceRadius} miles</Text>
          <Text style={styles.distanceSubtext}>{getDistanceLabel(distanceRadius)} distance</Text>
          
          <View style={styles.distanceButtons}>
            {distances.map(distance => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceButton,
                  distanceRadius === distance && styles.distanceButtonActive
                ]}
                onPress={() => handleDistanceChange(distance)}
              >
                <Text style={[
                  styles.distanceButtonText,
                  distanceRadius === distance && styles.distanceButtonTextActive
                ]}>
                  {distance}mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.locationButton, isLoading && styles.locationButtonDisabled]}
          onPress={requestLocationPermission}
          disabled={isLoading}
        >
          <Navigation color="#FFFFFF" size={24} />
          <Text style={styles.locationButtonText}>
            {isLoading ? 'Getting location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.searchContainer}>
          <Search color="#6B7280" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter address or city"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleManualLocation}
          />
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !searchText && styles.continueButtonDisabled]}
          onPress={handleManualLocation}
          disabled={!searchText}
        >
          <Text style={styles.continueButtonText}>Start Discovering</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 6,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  distanceContainer: {
    marginBottom: 24,
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  distanceSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  distanceButtonActive: {
    backgroundColor: '#10B981',
  },
  distanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  distanceButtonTextActive: {
    color: '#FFFFFF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  locationButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  continueButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 