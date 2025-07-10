import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Enhanced vibes with more categories that could map to Google Places types
const ENHANCED_VIBES = [
  { id: 'foodie', name: 'Foodie Paradise', emoji: '🍽️', color: '#FF6B6B', description: 'Great restaurants & cafes' },
  { id: 'chill', name: 'Chill & Relaxed', emoji: '😌', color: '#4ECDC4', description: 'Peaceful, laid-back spots' },
  { id: 'energy', name: 'High Energy', emoji: '⚡', color: '#45B7D1', description: 'Exciting, vibrant places' },
  { id: 'cultural', name: 'Cultural Explorer', emoji: '🎭', color: '#96CEB4', description: 'Museums, galleries, arts' },
  { id: 'social', name: 'Social & Fun', emoji: '🎉', color: '#FFEAA7', description: 'Bars, clubs, social spots' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', color: '#FD79A8', description: 'Perfect for date nights' },
  { id: 'outdoor', name: 'Outdoor Vibes', emoji: '🌳', color: '#00B894', description: 'Parks, outdoor activities' },
  { id: 'nightlife', name: 'Nightlife', emoji: '🌙', color: '#6C5CE7', description: 'Late night entertainment' },
  { id: 'shopping', name: 'Shopping Spree', emoji: '🛍️', color: '#A29BFE', description: 'Retail therapy time' },
  { id: 'coffee', name: 'Coffee Culture', emoji: '☕', color: '#D63031', description: 'Cozy cafes & coffee shops' },
  { id: 'adventure', name: 'Adventure Seeker', emoji: '🎯', color: '#E17055', description: 'Unique experiences' },
  { id: 'wellness', name: 'Wellness & Zen', emoji: '🧘', color: '#81ECEC', description: 'Spas, yoga, relaxation' },
];

export default function QuickVibeScreen() {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const { state, setDiscoverySession } = useApp();
  const router = useRouter();

  const toggleVibe = (vibeId: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibeId)
        ? prev.filter(id => id !== vibeId)
        : [...prev, vibeId]
    );
  };

  const handleContinue = () => {
    if (selectedVibes.length > 0) {
      // Create a discovery session with selected vibes and navigate to discover tab
      const sessionData = {
        type: 'surprise',
        venues: [], // Will be populated in the discovery screen
        currentIndex: 0,
        selectedVibes,
        selectedLocation: state.currentLocation,
      };
      
      setDiscoverySession(sessionData);
      
      // Navigate back to discover tab with session data
      router.push('/(tabs)/discover');
    }
  };

  const getVibeCardStyle = (vibe: any, isSelected: boolean) => {
    return [
      styles.vibeCard,
      isSelected && { 
        borderColor: vibe.color,
        borderWidth: 2,
        transform: [{ scale: 0.98 }]
      }
    ];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
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
            <Sparkles color="#FFFFFF" size={28} />
            <Text style={styles.title}>What's Your Vibe?</Text>
            <Text style={styles.subtitle}>
              Select what you're feeling today
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.instruction}>
          Choose multiple vibes to get better recommendations
        </Text>

        <View style={styles.vibesGrid}>
          {ENHANCED_VIBES.map((vibe) => {
            const isSelected = selectedVibes.includes(vibe.id);
            
            return (
              <TouchableOpacity
                key={vibe.id}
                style={getVibeCardStyle(vibe, isSelected)}
                onPress={() => toggleVibe(vibe.id)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <LinearGradient
                    colors={[vibe.color + '20', vibe.color + '10']}
                    style={styles.selectedOverlay}
                  />
                )}
                
                <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                <Text style={[
                  styles.vibeName,
                  isSelected && { color: vibe.color, fontWeight: '700' }
                ]}>
                  {vibe.name}
                </Text>
                <Text style={[
                  styles.vibeDescription,
                  isSelected && { color: vibe.color, opacity: 0.8 }
                ]}>
                  {vibe.description}
                </Text>

                {isSelected && (
                  <View style={[styles.selectedIndicator, { backgroundColor: vibe.color }]}>
                    <Text style={styles.selectedCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selection Summary */}
        {selectedVibes.length > 0 && (
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryTitle}>Selected Vibes:</Text>
            <View style={styles.selectedVibesContainer}>
              {selectedVibes.map(vibeId => {
                const vibe = ENHANCED_VIBES.find(v => v.id === vibeId);
                return vibe ? (
                  <View key={vibeId} style={[styles.selectedVibePill, { backgroundColor: vibe.color + '20' }]}>
                    <Text style={styles.selectedVibeEmoji}>{vibe.emoji}</Text>
                    <Text style={[styles.selectedVibeText, { color: vibe.color }]}>
                      {vibe.name}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedVibes.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedVibes.length === 0}
        >
          <LinearGradient
            colors={selectedVibes.length > 0 ? ['#10B981', '#059669'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.continueGradient}
          >
            <Sparkles color="#FFFFFF" size={20} />
            <Text style={styles.continueButtonText}>
              Start Discovery ({selectedVibes.length} selected)
            </Text>
          </LinearGradient>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  instruction: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 20,
  },
  vibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  vibeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 2, // Account for padding and gap
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  vibeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  vibeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  vibeDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  selectionSummary: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  selectedVibesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedVibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  selectedVibeEmoji: {
    fontSize: 14,
  },
  selectedVibeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});