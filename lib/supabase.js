import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://bvjzdtwkvcjadlepccmy.supabase.co'
const supabasePublishableKey = 'sb_publishable_Yx6mqFY-1HOtUalrm_RNzA_X7IuYr9I'

export const supabase = createClient('https://bvjzdtwkvcjadlepccmy.supabase.co', 'sb_publishable_Yx6mqFY-1HOtUalrm_RNzA_X7IuYr9I', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })