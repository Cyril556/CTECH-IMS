// Configuration file for the application

// API URL - Replace with your actual Render backend URL
export const API_URL = import.meta.env.VITE_API_URL || 'https://ctech-ims-api.onrender.com';

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://txphvpzcbamricsskvoe.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cGh2cHpjYmFtcmljc3Nrdm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTYyMzgsImV4cCI6MjA1OTA5MjIzOH0.mhjA8yG02TAeJ-PLS3nTXs59iHE74oc-QiN5XPm8aNY';

// Other configuration settings
export const APP_NAME = 'C TECH Inventory Management System';
export const DEFAULT_PAGE_SIZE = 10;
