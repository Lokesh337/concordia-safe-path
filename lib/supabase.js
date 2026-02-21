import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = "https://poewhcfkzjmpibhzcxht.supabase.co";
// const supabasePublishableKey = "sb_publishable_T5VRwC9dPG8MeJnVKYfnNw_OKEXCxZG";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});