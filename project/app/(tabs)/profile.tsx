import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Image } from 'react-native';
import { useApp } from '@/lib/appContext';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, Heart, Map, Calendar, ArrowRight, RotateCcw, Star, MapPin, Plus, CreditCard as Edit3, Trash2, Share } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SavedSauntr } from '@/lib/types';

export default function ProfileScreen() {
  const { state, signOut, setDiscoverySession, clearLikedVenues, deleteSauntr } = useApp();
  const router = useRouter();
  const [selectedSauntr, setSelectedSauntr] = useState<string | null>(null);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleReSauntr = async (sauntr: SavedSauntr) => {
    Alert.alert(
      'Re-Sauntr',
      `Load "${sauntr.title}" venues to the map? This will clear your current liked venues.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Venues',
          onPress: async () => {
            // Clear current liked venues
            await clearLikedVenues();
            
            // Add all venues from the sauntr to liked venues
            for (const venue of sauntr.venues) {
              // We'll need to add these venues to liked venues
              // For now, we'll create a discovery session with these venues
            }
            
            // Create a discovery session with the sauntr venues
            await setDiscoverySession({
              type: 'custom',
              venues: sauntr.venues,
              currentIndex: 0,
              selectedLocation: state.currentLocation,
            });
            
            // Navigate to map tab
            router.push('/(tabs)/map');
            
            Alert.alert('Success', `Loaded ${sauntr.venues.length} venues from "${sauntr.title}" to your map!`);
          },
        },
      ]
    );
  };

  const handleCreateSauntr = () => {
    if (state.likedVenues.length === 0) {
      Alert.alert(
        'No Liked Venues',
        'Like some venues first to create a Sauntr collection!',
        [
          { text: 'Start Discovering', onPress: () => router.push('/(tabs)/discover') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    // TODO: Implement create sauntr modal
    Alert.alert('Create Sauntr', 'Create Sauntr feature coming soon!');
  };

  const handleEditSauntr = (sauntr: SavedSauntr) => {
    // TODO: Implement edit sauntr modal
    Alert.alert('Edit Sauntr', `Edit "${sauntr.title}" feature coming soon!`);
  };

  const handleDeleteSauntr = async (sauntr: SavedSauntr) => {
    Alert.alert(
      'Delete Sauntr',
      `Are you sure you want to delete "${sauntr.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSauntr(sauntr.id);
              Alert.alert('Deleted', `"${sauntr.title}" has been deleted.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete Sauntr. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShareSauntr = (sauntr: SavedSauntr) => {
    // TODO: Implement share functionality
    Alert.alert('Share Sauntr', `Share "${sauntr.title}" feature coming soon!`);
  };

  const getColorThemeGradient = (theme: string) => {
    switch (theme) {
      case 'purple':
        return ['#8B5CF6', '#7C3AED'];
      case 'blue':
        return ['#3B82F6', '#1D4ED8'];
      case 'green':
        return ['#10B981', '#059669'];
      case 'orange':
        return ['#F97316', '#EA580C'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getUserDisplayName = () => {
    if (!state.user?.email) return 'User';
    return state.user.name || state.user.email.split('@')[0];
  };

  const savedSauntrs = state.user?.savedSauntrs || [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B7280', '#4B5563']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <User color="#FFFFFF" size={32} />
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              Manage your account and collections
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {state.user?.avatar ? (
              <Image source={{ uri: state.user.avatar }} style={styles.avatarImage} />
            ) : (
              <User color="#3B82F6" size={32} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <Text style={styles.userEmail}>{state.user?.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Heart color="#EF4444" size={24} />
            <Text style={styles.statNumber}>{savedSauntrs.length}</Text>
            <Text style={styles.statLabel}>Saved Sauntrs</Text>
          </View>
          
          <View style={styles.statItem}>
            <Map color="#3B82F6" size={24} />
            <Text style={styles.statNumber}>{state.user?.totalVisits || 0}</Text>
            <Text style={styles.statLabel}>Places Visited</Text>
          </View>
          
          <View style={styles.statItem}>
            <Calendar color="#10B981" size={24} />
            <Text style={styles.statNumber}>{state.user?.totalAdventures || 0}</Text>
            <Text style={styles.statLabel}>Adventures</Text>
          </View>
        </View>

        {/* Saved Sauntrs Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Saved Sauntrs</Text>

          {savedSauntrs.length === 0 ? (
            <View style={styles.emptySauntrs}>
              <View style={styles.emptyIcon}>
                <Heart color="#E5E7EB" size={48} />
              </View>
              <Text style={styles.emptyTitle}>No Saved Sauntrs Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create collections of your favorite venues to revisit later
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleCreateSauntr}
              >
                <Text style={styles.emptyButtonText}>Create Your First Sauntr</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sauntrsList}>
              {savedSauntrs.map((sauntr) => (
                <View key={sauntr.id} style={styles.sauntrCard}>
                  <LinearGradient
                    colors={getColorThemeGradient(sauntr.colorTheme)}
                    style={styles.sauntrGradient}
                  >
                    <View style={styles.sauntrHeader}>
                      <View style={styles.sauntrInfo}>
                        <Text style={styles.sauntrTitle}>{sauntr.title}</Text>
                        <Text style={styles.sauntrDescription}>{sauntr.description}</Text>
                        <View style={styles.sauntrMeta}>
                          <View style={styles.sauntrMetaItem}>
                            <MapPin color="#FFFFFF" size={14} />
                            <Text style={styles.sauntrMetaText}>
                              {sauntr.venueCount} venues
                            </Text>
                          </View>
                          <View style={styles.sauntrMetaItem}>
                            <Calendar color="#FFFFFF" size={14} />
                            <Text style={styles.sauntrMetaText}>
                              {new Date(sauntr.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.sauntrActions}>
                        <TouchableOpacity 
                          style={styles.sauntrActionButton}
                          onPress={() => handleShareSauntr(sauntr)}
                        >
                          <Share color="#FFFFFF" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.sauntrActionButton}
                          onPress={() => handleEditSauntr(sauntr)}
                        >
                          <Edit3 color="#FFFFFF" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.sauntrActionButton}
                          onPress={() => handleDeleteSauntr(sauntr)}
                        >
                          <Trash2 color="#FFFFFF" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Venue Preview */}
                    <View style={styles.venuePreview}>
                      <Text style={styles.venuePreviewTitle}>Venues:</Text>
                      <View style={styles.venuePreviewList}>
                        {sauntr.previewVenues.slice(0, 3).map((venueName, index) => (
                          <Text key={index} style={styles.venuePreviewItem}>
                            • {venueName}
                          </Text>
                        ))}
                        {sauntr.previewVenues.length > 3 && (
                          <Text style={styles.venuePreviewMore}>
                            +{sauntr.previewVenues.length - 3} more
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Re-Sauntr Button */}
                    <TouchableOpacity 
                      style={styles.reSauntrButton}
                      onPress={() => handleReSauntr(sauntr)}
                    >
                      <RotateCcw color="#FFFFFF" size={18} />
                      <Text style={styles.reSauntrButtonText}>Re-Sauntr</Text>
                      <ArrowRight color="#FFFFFF" size={16} />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Settings color="#6B7280" size={20} />
            <Text style={styles.menuText}>Settings</Text>
            <ArrowRight color="#6B7280" size={16} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <LogOut color="#EF4444" size={20} />
            <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
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
  header: {
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerText: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 2,
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#717171',
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  emptySauntrs: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sauntrsList: {
    gap: 16,
  },
  sauntrCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  sauntrGradient: {
    padding: 20,
  },
  sauntrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sauntrInfo: {
    flex: 1,
    marginRight: 12,
  },
  sauntrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sauntrDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
    fontWeight: '500',
  },
  sauntrMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  sauntrMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sauntrMetaText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
  },
  sauntrActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sauntrActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venuePreview: {
    marginBottom: 16,
  },
  venuePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  venuePreviewList: {
    gap: 4,
  },
  venuePreviewItem: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  venuePreviewMore: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  reSauntrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  reSauntrButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    fontSize: 15,
    color: '#484848',
    fontWeight: '600',
    marginLeft: 14,
    flex: 1,
  },
  signOutText: {
    color: '#FF385C',
  },
  bottomSpacing: {
    height: 32,
  },
});