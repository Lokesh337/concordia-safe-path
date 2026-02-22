/**
 * Initializes and exports the Supabase client used throughout the app.
 *
 * This is the single source for the Supabase connection
 * every context, hook, or service that needs to talk to the database
 * or auth system imports `supabase` from here.
 *
 * Environment variables:
 *  EXPO_PUBLIC_SUPABASE_URL  — The project URL from your Supabase dashboard
 *  EXPO_PUBLIC_SUPABASE_KEY  — The publishable key
 *                              (Settings → API → Project API keys → Publishable Key)
 *
 *  The EXPO_PUBLIC_ prefix tells Expo to bundle these values into the client
 *  build.
 */

import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        /**
         * This means the user stays logged in across app restarts without
         * needing to re-enter their credentials.
         */
        storage: localStorage,
        /**
         * Supabase JWTs expire after 1 hour by default. With this enabled,
         * the client automatically requests a new token in the background
         * before the current one expires, keeping the session alive as long
         * as the app is in use.
         */
        autoRefreshToken: true,

        /**
         * Tells the client to save the session to `storage` (localStorage above)
         * so it survives app restarts. Combined with autoRefreshToken, this
         * gives users a seamless "stay logged in" experience.
         */
        persistSession: true,
        detectSessionInUrl: false,
    },
});