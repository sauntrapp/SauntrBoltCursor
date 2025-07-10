import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { MapPin, Search, Navigation, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LocationScreen() {
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
        coordinates: '0,0',
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
        colors={['#3B82F6', '#1D4ED8']}
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
            <MapPin color="#FFFFFF" size={32} />
            <Text style={styles.title}>Set Your Location</Text>
            <Text style={styles.subtitle}>
              We'll use this to find venues near you
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
          <Text style={styles.continueButtonText}>Continue</Text>
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 1,
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
  distanceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  distanceSubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
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
  locationButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 16,
    color: '#111827',
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  distanceOption: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
  },
  distanceOptionActive: {
    transform: [{ scale: 1.02 }],
  },
  distanceOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  distanceOptionSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 16,
    color: '#111827',
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});