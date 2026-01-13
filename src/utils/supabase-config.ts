// Supabase configuration utility
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variable configuration
export const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isConfigured: !!(supabaseUrl && supabaseAnonKey && 
      supabaseUrl !== 'YOUR_SUPABASE_URL' && 
      supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY')
  };
};

// Initialize Supabase client with proper error handling
export const initializeSupabase = (): SupabaseClient<Database> | null => {
  const config = getSupabaseConfig();
  
  if (!config.isConfigured) {
    console.warn('⚠️ Supabase configuration missing');
    console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
    
    // Return a mock client that won't throw errors on initialization
    // This allows the app to load but database operations will fail gracefully
    try {
      // Using placeholder values that won't crash but will fail on actual operations
      return createClient<Database>(
        'https://placeholder.supabase.co', 
        'placeholder-key'
      );
    } catch (error) {
      console.error('Failed to create placeholder Supabase client:', error);
      return null;
    }
  }
  
  try {
    console.log('✅ Initializing Supabase client');
    const client = createClient<Database>(config.url!, config.key!);
    console.log('✅ Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    return null;
  }
};

// Export the initialized client
export const supabase = initializeSupabase();

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return getSupabaseConfig().isConfigured;
};

// Helper function to safely call Supabase operations
export const safeSupabaseCall = <T>(
  operation: () => T,
  fallback: T,
  errorMessage?: string
): T => {
  if (!supabase || !isSupabaseConfigured()) {
    if (errorMessage) {
      console.warn(errorMessage);
    }
    return fallback;
  }
  
  try {
    return operation();
  } catch (error) {
    console.error('Supabase operation failed:', error);
    return fallback;
  }
};