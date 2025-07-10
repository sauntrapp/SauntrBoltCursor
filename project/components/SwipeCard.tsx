import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform, Linking, ScrollView } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, 
  X, 
  Info, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  Wifi, 
  Car,
  Share,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageCircle,
  ThumbsUp
} from 'lucide-react-native';
import { Venue, Review } from '@/lib/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeCardProps {
  venue: Venue;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onInfo: () => void;
  showMatchScore?: boolean;
}

export default function SwipeCard({ 
  venue, 
  onSwipeLeft, 
  onSwipeRight, 
  onInfo,
  showMatchScore = false 
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // State for interactive elements
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
    },
    onEnd: (event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-screenWidth * 1.5);
        runOnJS(onSwipeLeft)();
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(screenWidth * 1.5);
        runOnJS(onSwipeRight)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      
      scale.value = withSpring(1);
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity,
    };
  });

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Helper functions
  const getPriceDisplay = (level?: number) => {
    if (!level) return '';
    return '$'.repeat(level);
  };

  const getVenueTypeColor = (type: string) => {
    switch (type) {
      case 'food': return '#FF6B6B';
      case 'social': return '#4ECDC4';
      case 'activity': return '#45B7D1';
      default: return '#6C5CE7';
    }
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getTimeBasedRecommendation = () => {
    const time = getCurrentTime();
    const type = venue.venueType;
    
    if (time === 'morning' && type === 'food') return 'Perfect for breakfast';
    if (time === 'afternoon' && type === 'activity') return 'Great afternoon activity';
    if (time === 'evening' && type === 'social') return 'Perfect for evening drinks';
    if (time === 'night' && type === 'social') return 'Great nightlife spot';
    return null;
  };

  const getWeatherRecommendation = () => {
    // Mock weather logic - in production, use real weather data
    const isGoodWeather = Math.random() > 0.3;
    if (venue.weatherSuitability === 'outdoor' && isGoodWeather) {
      return 'Perfect weather for outdoor dining';
    }
    if (venue.weatherSuitability === 'indoor' && !isGoodWeather) {
      return 'Great indoor option today';
    }
    return null;
  };

  const getWaitTime = () => {
    // Mock wait time - in production, use real-time data
    if (venue.venueType === 'food') {
      const waitTimes = ['No wait', '5-10 min', '15-20 min', '25+ min'];
      return waitTimes[Math.floor(Math.random() * 4)];
    }
    return null;
  };

  // Interactive handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      onSwipeRight();
    }
  };

  const handleShare = () => {
    // In production, implement actual sharing
    console.log('Share venue:', venue.name);
  };

  const handleCall = () => {
    if (venue.phone) {
      Linking.openURL(`tel:${venue.phone}`);
    }
  };

  const handleWebsite = () => {
    if (venue.website) {
      Linking.openURL(venue.website);
    }
  };

  const handleTapToExpand = () => {
    setIsExpanded(!isExpanded);
    setShowReviews(false); // Close reviews when expanding main info
  };

  const handleShowReviews = () => {
    setShowReviews(!showReviews);
    setIsExpanded(false); // Close main info when showing reviews
  };

  const handlePhotoNavigation = (direction: 'prev' | 'next') => {
    if (!venue.photos || venue.photos.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentPhotoIndex((prev) => 
        prev === venue.photos!.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? venue.photos!.length - 1 : prev - 1
      );
    }
  };

  const handlePassButton = () => {
    translateX.value = withSpring(-screenWidth * 1.5);
    runOnJS(onSwipeLeft)();
  };

  const handleLikeButton = () => {
    translateX.value = withSpring(screenWidth * 1.5);
    runOnJS(onSwipeRight)();
  };

  const renderStars = (rating: number, size: number = 12) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          color="#F59E0B"
          fill={i <= rating ? "#F59E0B" : "transparent"}
        />
      );
    }
    return stars;
  };

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Get current image
  const currentImage = venue.photos && venue.photos.length > 0 
    ? venue.photos[currentPhotoIndex] 
    : venue.image;

  const hasMultiplePhotos = venue.photos && venue.photos.length > 1;
  const accentColor = getVenueTypeColor(venue.venueType);
  const timeRecommendation = getTimeBasedRecommendation();
  const weatherRecommendation = getWeatherRecommendation();
  const waitTime = getWaitTime();

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Action indicators */}
          <Animated.View style={[styles.actionIndicator, styles.leftAction, leftActionStyle]}>
            <X color="#FFFFFF" size={40} />
            <Text style={styles.actionText}>PASS</Text>
          </Animated.View>

          <Animated.View style={[styles.actionIndicator, styles.rightAction, rightActionStyle]}>
            <Heart color="#FFFFFF" size={40} />
            <Text style={styles.actionText}>LIKE</Text>
          </Animated.View>

          {/* Photo carousel container */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: currentImage }} style={styles.image} />
            
            {/* Photo navigation */}
            {hasMultiplePhotos && (
              <>
                <TouchableOpacity 
                  style={[styles.photoNavButton, styles.photoNavLeft]}
                  onPress={() => handlePhotoNavigation('prev')}
                >
                  <ChevronLeft color="#FFFFFF" size={20} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.photoNavButton, styles.photoNavRight]}
                  onPress={() => handlePhotoNavigation('next')}
                >
                  <ChevronRight color="#FFFFFF" size={20} />
                </TouchableOpacity>

                {/* Photo indicators */}
                <View style={styles.photoIndicators}>
                  {venue.photos!.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.photoIndicator,
                        index === currentPhotoIndex && styles.photoIndicatorActive
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />

            {/* Top badges */}
            <View style={styles.topBadges}>
              {/* Match score badge */}
              {showMatchScore && venue.matchScore && (
                <View style={[styles.matchBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.matchText}>{venue.matchScore}% match</Text>
                </View>
              )}

              {/* Context-aware recommendations */}
              {(timeRecommendation || weatherRecommendation) && (
                <View style={styles.contextBadge}>
                  <Zap color="#FFFFFF" size={12} />
                  <Text style={styles.contextText}>
                    {timeRecommendation || weatherRecommendation}
                  </Text>
                </View>
              )}
            </View>

            {/* Top right info button */}
            <TouchableOpacity style={styles.infoButton} onPress={onInfo}>
              <Info color="#FFFFFF" size={18} />
            </TouchableOpacity>

            {/* Real-time status indicators */}
            <View style={styles.statusIndicators}>
              {/* Open/Closed status */}
              <View style={[styles.statusBadge, { backgroundColor: venue.openNow ? '#10B981' : '#EF4444' }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {venue.openNow ? 'OPEN' : 'CLOSED'}
                </Text>
              </View>
            </View>
          </View>

          {/* Reviews overlay */}
          {showReviews && venue.reviews && (
            <View style={styles.reviewsOverlay}>
              <View style={styles.reviewsHeader}>
                <View style={styles.reviewsHeaderLeft}>
                  <Text style={styles.reviewsTitle}>Reviews</Text>
                  <View style={styles.reviewsRating}>
                    <Star color="#F59E0B" size={16} fill="#F59E0B" />
                    <Text style={styles.reviewsRatingText}>
                      {venue.rating} ({venue.reviewCount || 0})
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.reviewsCloseButton}
                  onPress={() => setShowReviews(false)}
                >
                  <X color="#FFFFFF" size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.reviewsList}
                showsVerticalScrollIndicator={false}
              >
                {venue.reviews.map((review: Review) => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthor}>
                        {review.avatar && (
                          <Image 
                            source={{ uri: review.avatar }} 
                            style={styles.reviewAvatar}
                          />
                        )}
                        <View style={styles.reviewAuthorInfo}>
                          <Text style={styles.reviewAuthorName}>{review.author}</Text>
                          <View style={styles.reviewStars}>
                            {renderStars(review.rating, 10)}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>
                        {formatReviewDate(review.date)}
                      </Text>
                    </View>
                    
                    <Text style={styles.reviewText}>{review.text}</Text>
                    
                    {review.helpful && review.helpful > 0 && (
                      <View style={styles.reviewHelpful}>
                        <ThumbsUp color="#FFFFFF" size={12} />
                        <Text style={styles.reviewHelpfulText}>
                          {review.helpful} found this helpful
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Main info overlay - tap to expand */}
          <TouchableOpacity 
            style={[
              styles.infoOverlay, 
              isExpanded && styles.infoOverlayExpanded,
              showReviews && styles.infoOverlayHidden
            ]}
            onPress={handleTapToExpand}
            activeOpacity={0.9}
          >
            {/* Main venue info */}
            <View style={styles.mainInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={isExpanded ? 3 : 2}>
                  {venue.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Star color="#F59E0B" size={16} fill="#F59E0B" />
                  <Text style={styles.rating}>{venue.rating}</Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <MapPin color="#FFFFFF" size={14} />
                <Text style={styles.address} numberOfLines={1}>
                  {venue.address}
                </Text>
                {venue.distance && (
                  <Text style={[styles.distance, { color: accentColor }]}>
                    {venue.distance}
                  </Text>
                )}
              </View>
            </View>

            {/* Venue categories/tags */}
            {venue.categories && venue.categories.length > 0 && (
              <View style={styles.categoriesRow}>
                {venue.categories.slice(0, isExpanded ? 4 : 3).map((category, index) => (
                  <View key={index} style={[styles.categoryTag, { backgroundColor: accentColor + '30' }]}>
                    <Text style={[styles.categoryText, { color: accentColor }]}>
                      {category}
                    </Text>
                  </View>
                ))}
                {venue.categories.length > 3 && !isExpanded && (
                  <Text style={styles.moreCategoriesText}>
                    +{venue.categories.length - 3} more
                  </Text>
                )}
              </View>
            )}

            {/* Reviews button */}
            {venue.reviews && venue.reviews.length > 0 && (
              <TouchableOpacity 
                style={styles.reviewsButton}
                onPress={handleShowReviews}
              >
                <MessageCircle color="#FFFFFF" size={16} />
                <Text style={styles.reviewsButtonText}>
                  {venue.reviewCount || venue.reviews.length} Reviews
                </Text>
              </TouchableOpacity>
            )}

            {/* Expanded details */}
            {isExpanded && (
              <View style={styles.expandedDetails}>
                {/* Description */}
                {venue.description && (
                  <Text style={styles.description} numberOfLines={3}>
                    {venue.description}
                  </Text>
                )}

                {/* Real-time info */}
                <View style={styles.realTimeInfo}>
                  {waitTime && (
                    <View style={styles.infoItem}>
                      <Clock color="#FFFFFF" size={14} />
                      <Text style={styles.infoText}>Wait: {waitTime}</Text>
                    </View>
                  )}
                  
                  {venue.priceLevel && (
                    <View style={styles.infoItem}>
                      <DollarSign color="#10B981" size={14} />
                      <Text style={styles.infoText}>{getPriceDisplay(venue.priceLevel)}</Text>
                    </View>
                  )}
                </View>

                {/* Contact actions */}
                <View style={styles.contactActions}>
                  {venue.phone && (
                    <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                      <Phone color="#FFFFFF" size={16} />
                      <Text style={styles.contactButtonText}>Call</Text>
                    </TouchableOpacity>
                  )}
                  
                  {venue.website && (
                    <TouchableOpacity style={styles.contactButton} onPress={handleWebsite}>
                      <ExternalLink color="#FFFFFF" size={16} />
                      <Text style={styles.contactButtonText}>Website</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Features */}
                <View style={styles.featuresRow}>
                  {Math.random() > 0.5 && (
                    <View style={styles.featureItem}>
                      <Wifi color="#FFFFFF" size={12} />
                      <Text style={styles.featureText}>WiFi</Text>
                    </View>
                  )}
                  {Math.random() > 0.6 && (
                    <View style={styles.featureItem}>
                      <Car color="#FFFFFF" size={12} />
                      <Text style={styles.featureText}>Parking</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Tap to expand indicator */}
            <View style={styles.expandIndicator}>
              <View style={[
                styles.expandLine, 
                isExpanded && styles.expandLineRotated
              ]} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Enhanced action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]} 
          onPress={handlePassButton}
        >
          <X color="#EF4444" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]} 
          onPress={handleShare}
        >
          <Share color="#6B7280" size={18} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.infoActionButton]} 
          onPress={onInfo}
        >
          <Info color="#6B7280" size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton, isLiked && styles.likeButtonActive]} 
          onPress={handleLikeButton}
        >
          <Heart 
            color={isLiked ? "#FFFFFF" : "#EF4444"} 
            size={24} 
            fill={isLiked ? "#FFFFFF" : "transparent"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // Add space for action buttons
  },
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.65, // Reduce card height to make room for buttons
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoNavButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    transform: [{ translateY: -20 }],
  },
  photoNavLeft: {
    left: 16,
  },
  photoNavRight: {
    right: 16,
  },
  photoIndicators: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  topBadges: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 70,
    flexDirection: 'row',
    gap: 8,
    zIndex: 5,
  },
  matchBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    flex: 1,
  },
  contextText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  infoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
  },
  statusIndicators: {
    position: 'absolute',
    top: 100,
    right: 20,
    gap: 6,
    zIndex: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionIndicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    transform: [{ translateY: -50 }],
  },
  leftAction: {
    left: 40,
  },
  rightAction: {
    right: 40,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 1,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 5,
    minHeight: 160,
  },
  infoOverlayExpanded: {
    minHeight: 280,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  infoOverlayHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  reviewsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    zIndex: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  reviewsHeaderLeft: {
    flex: 1,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  reviewsRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewsRatingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reviewsCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '500',
  },
  reviewText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  reviewHelpful: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewHelpfulText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '500',
  },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  reviewsButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainInfo: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    flex: 1,
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreCategoriesText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '500',
  },
  expandedDetails: {
    gap: 12,
  },
  description: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
    fontWeight: '500',
  },
  realTimeInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  contactButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  expandIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 24,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandLine: {
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
    borderRadius: 1,
  },
  expandLineRotated: {
    transform: [{ rotate: '90deg' }],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  passButton: {
    borderWidth: 3,
    borderColor: '#FF385C',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  infoActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  likeButton: {
    borderWidth: 3,
    borderColor: '#10B981',
  },
  likeButtonActive: {
    backgroundColor: '#10B981',
  },
});