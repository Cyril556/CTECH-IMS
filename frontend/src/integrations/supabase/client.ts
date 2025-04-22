
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/Database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';

// Use configuration values for Supabase connection
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

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
