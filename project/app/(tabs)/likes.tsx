import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { Heart, Map, Share, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react-native';
import VenueCard from '@/components/VenueCard';
import { LinearGradient } from 'expo-linear-gradient';
import SamuelSauntrWidget from '@/components/SamuelSauntrWidget';

export default function LikesScreen() {
  const { state, removeLikedVenue } = useApp();
  const router = useRouter();

  const handleRemoveLike = async (venueId: string) => {
    await removeLikedVenue(venueId);
  };

  const handleSaveSauntr = () => {
    if (state.likedVenues.length === 0) {
      Alert.alert('No Venues', 'Like some venues first to create a Sauntr!');
      return;
    }
    
    // TODO: Show save sauntr modal
    Alert.alert('Save Sauntr', 'Save Sauntr modal coming soon!');
  };

  const handleViewOnMap = () => {
    if (state.likedVenues.length === 0) {
      Alert.alert('No Venues', 'Like some venues first to view them on the map!');
      return;
    }
    
    router.push('/(tabs)/map');
  };

  const handleStartDiscovery = () => {
    router.push('/(tabs)/discover');
  };

  if (state.likedVenues.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#ec4899', '#be185d']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Heart color="#FFFFFF" size={32} />
            <Text style={styles.title}>Liked Venues</Text>
            <Text style={styles.subtitle}>Your favorite discoveries</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Heart color="#EC4899" size={64} />
          </View>
          <Text style={styles.emptyTitle}>No liked venues yet</Text>
          <Text style={styles.emptySubtitle}>
            Start discovering amazing places and they'll appear here
          </Text>
          
          <TouchableOpacity 
            style={styles.discoverButton} 
            onPress={handleStartDiscovery}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles color="#FFFFFF" size={20} />
              <Text style={styles.discoverButtonText}>Start Discovering</Text>
              <ArrowRight color="#FFFFFF" size={16} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ec4899', '#be185d']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Heart color="#FFFFFF" size={32} />
          <Text style={styles.title}>Liked Venues</Text>
          <Text style={styles.subtitle}>
            {state.likedVenues.length} {state.likedVenues.length === 1 ? 'place' : 'places'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Samuel Sauntr Widget */}
        <SamuelSauntrWidget 
          location={state.currentLocation?.address}
          onLocationPress={() => router.push('/onboarding/location')}
          context="likes"
        />

        {state.likedVenues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            isLiked={true}
            onLike={() => handleRemoveLike(venue.id)}
            onPress={() => {
              // TODO: Show venue detail modal
              Alert.alert('Venue Details', 'Venue details modal coming soon!');
            }}
          />
        ))}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.mapButton]}
          onPress={handleViewOnMap}
        >
          <Map color="#3B82F6" size={18} />
          <Text style={styles.actionButtonText}>View on Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleSaveSauntr}
        >
          <Share color="#FFFFFF" size={18} />
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
            Save Sauntr
          </Text>
        </TouchableOpacity>
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
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomSpacing: {
    height: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '500',
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mapButton: {
    backgroundColor: '#EBF4FF',
  },
  primaryButton: {
    backgroundColor: '#FF385C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});