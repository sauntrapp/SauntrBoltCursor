import { supabase } from './supabase';
import { UserPreferences, SavedSauntr, User } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER, MOCK_SAVED_SAUNTRS } from './mockData';

// Development mode flag - always use mock data unless explicitly configured
const USE_MOCK_DATA = !process.env.EXPO_PUBLIC_SUPABASE_URL || 
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'your_supabase_url' ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY === 'placeholder-key';

export class UserService {
  private static instance: UserService;
  private currentUser: User | null = null;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async signUp(email: string, password: string, name?: string): Promise<{ user: User | null; error: string | null }> {
    try {
      if (USE_MOCK_DATA) {
        // Return mock user for development
        const mockUser = {
          ...MOCK_USER,
          email,
          name: name || MOCK_USER.name,
          savedSauntrs: MOCK_SAVED_SAUNTRS,
        };
        this.currentUser = mockUser;
        await this.saveUserToStorage(mockUser);
        return { user: mockUser, error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            total_visits: 0,
            total_adventures: 0,
            beta_cohort: 'mobile_v1',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        const user = await this.createUserFromAuth(data.user);
        this.currentUser = user;
        await this.saveUserToStorage(user);
        return { user, error: null };
      }

      return { user: null, error: 'Sign up failed' };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      if (USE_MOCK_DATA) {
        // Return mock user for development
        const mockUser = {
          ...MOCK_USER,
          email,
          savedSauntrs: MOCK_SAVED_SAUNTRS,
        };
        this.currentUser = mockUser;
        await this.saveUserToStorage(mockUser);
        return { user: mockUser, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const user = await this.createUserFromAuth(data.user);
        this.currentUser = user;
        await this.saveUserToStorage(user);
        await this.updateLastActive(user.id);
        return { user, error: null };
      }

      return { user: null, error: 'Sign in failed' };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      if (USE_MOCK_DATA) {
        this.currentUser = null;
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userPreferences');
        await AsyncStorage.removeItem('discoverySession');
        await AsyncStorage.removeItem('likedVenues');
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }

      this.currentUser = null;
      
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (USE_MOCK_DATA) {
      if (this.currentUser) {
        return this.currentUser;
      }

      // Try to get from local storage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }

      return null;
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.currentUser = await this.createUserFromAuth(user);
        return this.currentUser;
      }

      // Try to get from local storage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<{ error: string | null }> {
    try {
      if (USE_MOCK_DATA) {
        const user = await this.getCurrentUser();
        if (!user) {
          return { error: 'User not authenticated' };
        }

        // Update local user object
        this.currentUser!.preferences = preferences;
        await this.saveUserToStorage(this.currentUser!);
        await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
        return { error: null };
      }

      const user = await this.getCurrentUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          vibes: preferences.vibes,
          venue_types: preferences.venueTypes,
          cuisine_preferences: preferences.cuisinePreferences,
          activity_preferences: preferences.activityPreferences,
          budget_range: preferences.budgetRange,
          rating_threshold: preferences.ratingThreshold,
          max_distance: preferences.maxDistance,
          special_features: preferences.specialFeatures,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { error: error.message };
      }

      // Update local user object
      this.currentUser!.preferences = preferences;
      await this.saveUserToStorage(this.currentUser!);
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      if (USE_MOCK_DATA) {
        const user = await this.getCurrentUser();
        if (!user) {
          return null;
        }

        // Try to get from local storage first
        const storedPreferences = await AsyncStorage.getItem('userPreferences');
        if (storedPreferences) {
          return JSON.parse(storedPreferences);
        }

        return user.preferences || null;
      }

      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      // Try to get from local storage first
      const storedPreferences = await AsyncStorage.getItem('userPreferences');
      if (storedPreferences) {
        return JSON.parse(storedPreferences);
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return null;
      }

      const preferences: UserPreferences = {
        vibes: data.vibes,
        venueTypes: data.venue_types,
        cuisinePreferences: data.cuisine_preferences,
        activityPreferences: data.activity_preferences,
        budgetRange: data.budget_range,
        ratingThreshold: data.rating_threshold,
        maxDistance: data.max_distance,
        specialFeatures: data.special_features,
      };

      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async saveSauntr(sauntr: Omit<SavedSauntr, 'id' | 'createdAt'>): Promise<{ savedSauntr: SavedSauntr | null; error: string | null }> {
    try {
      if (USE_MOCK_DATA) {
        const user = await this.getCurrentUser();
        if (!user) {
          return { savedSauntr: null, error: 'User not authenticated' };
        }

        const savedSauntr: SavedSauntr = {
          id: `sauntr_${Date.now()}`,
          title: sauntr.title,
          description: sauntr.description,
          venues: sauntr.venues,
          colorTheme: sauntr.colorTheme,
          venueCount: sauntr.venueCount,
          previewVenues: sauntr.previewVenues,
          createdAt: new Date().toISOString(),
        };

        // Update local user object
        this.currentUser!.savedSauntrs.push(savedSauntr);
        await this.saveUserToStorage(this.currentUser!);

        return { savedSauntr, error: null };
      }

      const user = await this.getCurrentUser();
      if (!user) {
        return { savedSauntr: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('saved_sauntrs')
        .insert({
          user_id: user.id,
          title: sauntr.title,
          description: sauntr.description,
          venues: sauntr.venues,
          color_theme: sauntr.colorTheme,
          venue_count: sauntr.venueCount,
          preview_venues: sauntr.previewVenues,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { savedSauntr: null, error: error.message };
      }

      const savedSauntr: SavedSauntr = {
        id: data.id,
        title: data.title,
        description: data.description,
        venues: data.venues,
        colorTheme: data.color_theme,
        venueCount: data.venue_count,
        previewVenues: data.preview_venues,
        createdAt: data.created_at,
      };

      // Update local user object
      this.currentUser!.savedSauntrs.push(savedSauntr);
      await this.saveUserToStorage(this.currentUser!);

      return { savedSauntr, error: null };
    } catch (error) {
      return { savedSauntr: null, error: (error as Error).message };
    }
  }

  async getSavedSauntrs(): Promise<SavedSauntr[]> {
    try {
      if (USE_MOCK_DATA) {
        const user = await this.getCurrentUser();
        if (!user) {
          return [];
        }
        return user.savedSauntrs || MOCK_SAVED_SAUNTRS;
      }

      const user = await this.getCurrentUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('saved_sauntrs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        venues: item.venues,
        colorTheme: item.color_theme,
        venueCount: item.venue_count,
        previewVenues: item.preview_venues,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error getting saved sauntrs:', error);
      return [];
    }
  }

  async deleteSauntr(id: string): Promise<{ error: string | null }> {
    try {
      if (USE_MOCK_DATA) {
        // For mock data, update the current user object
        if (this.currentUser) {
          this.currentUser.savedSauntrs = this.currentUser.savedSauntrs.filter(s => s.id !== id);
          await this.saveUserToStorage(this.currentUser);
        }
        return { error: null };
      }

      const { error } = await supabase
        .from('saved_sauntrs')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      // Update local user object for Supabase as well
      if (this.currentUser) {
        this.currentUser.savedSauntrs = this.currentUser.savedSauntrs.filter(s => s.id !== id);
        await this.saveUserToStorage(this.currentUser);
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async trackActivity(activityType: string, venueId?: string, venueName?: string, location?: string, metadata?: any): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        // Just log activity in development mode
        console.log('Activity tracked:', { activityType, venueId, venueName, location, metadata });
        return;
      }

      const user = await this.getCurrentUser();
      if (!user) return;

      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          venue_id: venueId,
          venue_name: venueName,
          location,
          metadata,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  private async createUserFromAuth(authUser: any): Promise<User> {
    if (USE_MOCK_DATA) {
      return {
        ...MOCK_USER,
        id: authUser.id || MOCK_USER.id,
        email: authUser.email || MOCK_USER.email,
        name: authUser.user_metadata?.name || MOCK_USER.name,
      };
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const savedSauntrs = await this.getSavedSauntrs();

    return {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.user_metadata?.name,
      avatar: profile?.avatar,
      createdAt: profile?.created_at || authUser.created_at,
      lastActive: profile?.last_active || new Date().toISOString(),
      savedSauntrs,
      totalVisits: profile?.total_visits || 0,
      totalAdventures: profile?.total_adventures || 0,
      preferences: await this.getUserPreferences(),
    };
  }

  private async saveUserToStorage(user: User): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }

  private async updateLastActive(userId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }

    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', userId);
  }
}

export const userService = UserService.getInstance();