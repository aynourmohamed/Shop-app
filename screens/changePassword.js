import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://bvjzdtwkvcjadlepccmy.supabase.co', 'sb_publishable_Yx6mqFY-1HOtUalrm_RNzA_X7IuYr9I')

// ---cut---
await supabase.auth.updateUser({ password: 'new_password' })