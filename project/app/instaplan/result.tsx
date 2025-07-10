import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCcw, Heart, Map, Clock, MapPin, Star, Navigation, Share, CircleCheck as CheckCircle, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { InstaPlan } from '@/lib/types';
import { generateInstaPlan } from '@/lib/instaPlanService';

export default function InstaPlanResultScreen() {
  const { state, addLikedVenue, clearLikedVenues } = useApp();
  const router = useRouter();
  const { planData } = useLocalSearchParams();
  
  const [plan, setPlan] = useState<InstaPlan | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [acceptedPlan, setAcceptedPlan] = useState(false);

  useEffect(() => {
    if (planData && typeof planData === 'string') {
      try {
        const parsedPlan = JSON.parse(planData);
        setPlan(parsedPlan);
      } catch (error) {
        console.error('Failed to parse plan data:', error);
        router.push('/(tabs)');
      }
    }
  }, [planData]);

  const handleBack = () => {
    // Navigate back to the welcome screen (tabs index)
    router.push('/(tabs)');
  };
  const handleRegenerate = async () => {
    if (!state.currentLocation) return;
    
    setIsRegenerating(true);
    try {
      const newPlan = await generateInstaPlan(state.currentLocation);
      setPlan(newPlan);
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
      Alert.alert('Error', 'Failed to generate new plan. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAcceptPlan = async () => {
    if (!plan) return;

    // Clear existing liked venues and add plan venues
    await clearLikedVenues();
    
    // Add all plan venues to liked venues
    for (const venue of plan.venues) {
      await addLikedVenue(venue);
    }
    
    setAcceptedPlan(true);
    
    // Navigate to map to show the plan
    setTimeout(() => {
      router.push('/(tabs)/map');
    }, 1500);
  };

  const handleSaveSauntr = () => {
    if (!plan) return;
    
    Alert.alert(
      'Save Sauntr',
      `Save "${plan.title}" as a collection in your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => {
            // TODO: Implement save to profile functionality
            Alert.alert('Saved!', `"${plan.title}" has been saved to your profile.`);
          }
        }
      ]
    );
  };

  const handleSpinWheel = async () => {
    if (!plan) return;
    
    // Regenerate the plan
    await handleRegenerate();
  };

  const getTimeLabel = (index: number) => {
    const now = new Date();
    const startTime = new Date(now.getTime() + (index * 60 * 60 * 1000)); // Each venue is 1 hour apart
    return startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const getVenueTypeColor = (type: string) => {
    switch (type) {
      case 'food': return '#FF6B6B';
      case 'social': return '#4ECDC4';
      case 'activity': return '#45B7D1';
      default: return '#6C5CE7';
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text>Loading plan...</Text>
      </View>
    );
  }

  if (acceptedPlan) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.successContainer}
        >
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <CheckCircle color="#FFFFFF" size={64} />
            </View>
            <Text style={styles.successTitle}>Adventure Started!</Text>
            <Text style={styles.successSubtitle}>
              Your InstaPlan has been added to your map. Ready to explore?
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (isRegenerating) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.loadingContainer}
        >
          <RotateCcw color="#FFFFFF" size={48} />
          <Text style={styles.loadingText}>Generating new plan...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your InstaPlan</Text>
            <Text style={styles.headerSubtitle}>{plan.title}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          
          <View style={styles.planMeta}>
            <View style={styles.metaItem}>
              <Clock color="#8B5CF6" size={16} />
              <Text style={styles.metaText}>{plan.estimatedDuration}</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin color="#8B5CF6" size={16} />
              <Text style={styles.metaText}>{plan.totalDistance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Star color="#8B5CF6" size={16} />
              <Text style={styles.metaText}>Perfect for {plan.timeOfDay}</Text>
            </View>
          </View>

          {plan.weatherNote && (
            <View style={styles.weatherNote}>
              <Text style={styles.weatherNoteText}>{plan.weatherNote}</Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Your Adventure Timeline</Text>
          
          {plan.venues.map((venue, index) => (
            <View key={venue.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineNumber, { backgroundColor: getVenueTypeColor(venue.venueType) }]}>
                  <Text style={styles.timelineNumberText}>{index + 1}</Text>
                </View>
                {index < plan.venues.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineTime}>
                  <Clock color="#717171" size={14} />
                  <Text style={styles.timelineTimeText}>{getTimeLabel(index)}</Text>
                  <Text style={styles.timelineRole}>{plan.venueRoles[index]}</Text>
                </View>

                <View style={styles.venueCard}>
                  <Image source={{ uri: venue.image }} style={styles.venueImage} />
                  
                  <View style={styles.venueInfo}>
                    <Text style={styles.venueName}>{venue.name}</Text>
                    <Text style={styles.venueAddress} numberOfLines={1}>{venue.address}</Text>
                    
                    <View style={styles.venueDetails}>
                      <View style={styles.venueRating}>
                        <Star color="#F59E0B" size={12} fill="#F59E0B" />
                        <Text style={styles.venueRatingText}>{venue.rating}</Text>
                      </View>
                      
                      {venue.distance && (
                        <Text style={styles.venueDistance}>{venue.distance}</Text>
                      )}
                      
                      <View style={[styles.venueStatus, { backgroundColor: venue.openNow ? '#10B981' : '#EF4444' }]}>
                        <Text style={styles.venueStatusText}>
                          {venue.openNow ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>

                    {venue.categories && venue.categories.length > 0 && (
                      <View style={styles.venueCategories}>
                        {venue.categories.slice(0, 2).map((category, catIndex) => (
                          <View key={catIndex} style={styles.categoryTag}>
                            <Text style={styles.categoryText}>{category}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {plan.venueNotes && plan.venueNotes[index] && (
                  <View style={styles.venueNote}>
                    <Text style={styles.venueNoteText}>{plan.venueNotes[index]}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleSaveSauntr}
          >
            <Heart color="#EF4444" size={20} />
            <Text style={styles.secondaryButtonText}>Save this Sauntr</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleSpinWheel}
          >
            <RotateCcw color="#8B5CF6" size={20} />
            <Text style={styles.secondaryButtonText}>Spin the wheel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleAcceptPlan}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.primaryGradient}
          >
            <Play color="#FFFFFF" size={20} />
            <Text style={styles.primaryButtonText}>Start my adventure</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#717171',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  planMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#484848',
    fontWeight: '600',
  },
  weatherNote: {
    backgroundColor: '#EBF4FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  weatherNoteText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  timelineContainer: {
    marginBottom: 24,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  timelineTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  timelineRole: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 8,
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 13,
    color: '#717171',
    marginBottom: 12,
    fontWeight: '500',
  },
  venueDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#484848',
  },
  venueDistance: {
    fontSize: 12,
    color: '#717171',
    fontWeight: '600',
  },
  venueStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  venueStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  venueCategories: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#484848',
    fontWeight: '600',
  },
  venueNote: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  venueNoteText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#484848',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});