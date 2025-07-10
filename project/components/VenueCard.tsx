import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Heart, MapPin, Star, Clock, DollarSign } from 'lucide-react-native';
import { Venue } from '@/lib/types';
import { LinearGradient } from 'expo-linear-gradient';

interface VenueCardProps {
  venue: Venue;
  onLike?: () => void;
  onPress?: () => void;
  isLiked?: boolean;
  showMatchScore?: boolean;
}

export default function VenueCard({ 
  venue, 
  onLike, 
  onPress, 
  isLiked = false,
  showMatchScore = false 
}: VenueCardProps) {
  const getPriceDisplay = (level?: number) => {
    if (!level) return '';
    return '$'.repeat(level);
  };

  const getStatusColor = (isOpen?: boolean) => {
    return isOpen ? '#10B981' : '#EF4444';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: venue.image }} style={styles.image} />
        
        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageOverlay}
        />
        
        {/* Like button */}
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={onLike}
          activeOpacity={0.8}
        >
          <Heart 
            color={isLiked ? '#EF4444' : '#FFFFFF'} 
            size={20} 
            fill={isLiked ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>

        {/* Match score badge */}
        {showMatchScore && venue.matchScore && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{venue.matchScore}% match</Text>
          </View>
        )}

        {/* Distance badge */}
        {venue.distance && (
          <View style={styles.distanceBadge}>
            <MapPin color="#FFFFFF" size={12} />
            <Text style={styles.distanceText}>{venue.distance}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <View style={styles.ratingContainer}>
            <Star color="#F59E0B" size={14} fill="#F59E0B" />
            <Text style={styles.rating}>{venue.rating}</Text>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={1}>{venue.address}</Text>

        <View style={styles.details}>
          <View style={styles.detailsLeft}>
            {venue.categories && venue.categories.length > 0 && (
              <Text style={styles.category}>{venue.categories[0]}</Text>
            )}
            
            {venue.priceLevel && (
              <View style={styles.priceContainer}>
                <DollarSign color="#10B981" size={14} />
                <Text style={styles.price}>{getPriceDisplay(venue.priceLevel)}</Text>
              </View>
            )}
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(venue.openNow) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(venue.openNow) }]}>
              {venue.openNow ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  likeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  matchBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#484848',
  },
  address: {
    fontSize: 13,
    color: '#717171',
    marginBottom: 10,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  category: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});