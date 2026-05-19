import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = 'https://bvjzdtwkvcjadlepccmy.supabase.co';
const supabasePublishableKey = 'sb_publishable_Yx6mqFY-1HOtUalrm_RNzA_X7IuYr9I';

const SecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient('https://bvjzdtwkvcjadlepccmy.supabase.co', 'sb_publishable_Yx6mqFY-1HOtUalrm_RNzA_X7IuYr9I', {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })