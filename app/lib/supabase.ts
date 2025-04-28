import { AppState } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kaqwljgkbeqyotgegusj.supabase.co'
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcXdsamdrYmVxeW90Z2VndXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjQzNTcsImV4cCI6MjA2MDMwMDM1N30.113AjhDtwGjppBTDP6T09Df__LIE2UGTcnk01HC3Y2k"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
    }
});

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
  