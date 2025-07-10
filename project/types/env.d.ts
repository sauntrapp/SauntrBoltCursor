declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_GOOGLE_PLACES_API_KEY: string;
      EXPO_PUBLIC_OPENWEATHER_API_KEY: string;
    }
  }
}

export {};