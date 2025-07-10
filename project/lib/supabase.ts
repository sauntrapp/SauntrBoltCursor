import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use placeholder values to prevent API calls when not properly configured
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL && 
  process.env.EXPO_PUBLIC_SUPABASE_URL !== 'your_supabase_url' 
    ? process.env.EXPO_PUBLIC_SUPABASE_URL 
    : 'https://placeholder.supabase.co';

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key' 
    ? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY 
    : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name?: string;
          avatar?: string;
          created_at: string;
          updated_at: string;
          last_active: string;
          total_visits: number;
          total_adventures: number;
          beta_cohort?: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          avatar?: string;
          created_at?: string;
          updated_at?: string;
          last_active?: string;
          total_visits?: number;
          total_adventures?: number;
          beta_cohort?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string;
          created_at?: string;
          updated_at?: string;
          last_active?: string;
          total_visits?: number;
          total_adventures?: number;
          beta_cohort?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          vibes: string[];
          venue_types: string[];
          cuisine_preferences: string[];
          activity_preferences: string[];
          budget_range: [number, number];
          rating_threshold: number;
          max_distance: number;
          special_features: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vibes: string[];
          venue_types: string[];
          cuisine_preferences: string[];
          activity_preferences: string[];
          budget_range: [number, number];
          rating_threshold: number;
          max_distance: number;
          special_features: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vibes?: string[];
          venue_types?: string[];
          cuisine_preferences?: string[];
          activity_preferences?: string[];
          budget_range?: [number, number];
          rating_threshold?: number;
          max_distance?: number;
          special_features?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_sauntrs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          venues: any[];
          color_theme: string;
          venue_count: number;
          preview_venues: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          venues: any[];
          color_theme: string;
          venue_count: number;
          preview_venues: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          venues?: any[];
          color_theme?: string;
          venue_count?: number;
          preview_venues?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          venue_id?: string;
          venue_name?: string;
          location?: string;
          metadata?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          venue_id?: string;
          venue_name?: string;
          location?: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          venue_id?: string;
          venue_name?: string;
          location?: string;
          metadata?: any;
          created_at?: string;
        };
      };
    };
  };
}