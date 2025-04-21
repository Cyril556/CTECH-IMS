
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/Database.types';

// Use environment variables with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://txphvpzcbamricsskvoe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cGh2cHpjYmFtcmljc3Nrdm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTYyMzgsImV4cCI6MjA1OTA5MjIzOH0.mhjA8yG02TAeJ-PLS3nTXs59iHE74oc-QiN5XPm8aNY';

// Create and export the Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add a simple test function to check if the connection is working
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('inventory_items').select('count').single();
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Initialize test on load (development only)
if (import.meta.env.DEV) {
  testSupabaseConnection().then(isConnected => {
    console.log(`Supabase connection status: ${isConnected ? 'Connected' : 'Failed'}`);
  });
}
