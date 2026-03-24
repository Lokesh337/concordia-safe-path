/**
 * Provides global authentication state and auth actions to the entire app.
 *
 *  - user: Supabase User object when logged in, null otherwise.
 *  - authChecked : boolean flag - true once we've received the initial
 *                   response from Supabase. Used for route protection
 *  - login() : Signs in with email + password. Throws on failure.
 *  - register() : Creates a new account. Throws on failure.
 *  - logout(): Signs out and clears the session.
 *  - emergencyContacts: prefetched on login, cached in AsyncStorage for offline use
 *  - setEmergencyContacts: allows resources.jsx to update the shared list
 *
 * real-time auth state:
 *  onAuthStateChange() subscribes to Supabase auth events (SIGNED_IN,
 *  SIGNED_OUT, TOKEN_REFRESHED, etc.) and keeps the user state in sync.
 */

import { createContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from "../lib/supabase";

export const UserContext = createContext()

const contactsCacheKey = (userId) => `emergency_contacts_${userId}`

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [profileChecked, setProfileChecked] = useState(false)
    const [authChecked, setAuthChecked] = useState(false)
    const [pendingRedirect, setPendingRedirect] = useState(false)

    // emergency contacts — prefetched on login, available app-wide
    const [emergencyContacts, setEmergencyContacts] = useState([])

    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
        if (error) {
            console.warn('fetchProfile error:', error.message)
            setProfile(null)
        } else {
            setProfile(data)
        }
        setProfileChecked(true)
    }

// loads contacts from cache immediately, then refreshes from Supabase in background
// cache means contacts are available even if the user opens the app offline
    async function loadEmergencyContacts(userId) {
        // Helper to add timeout to AsyncStorage
        const withTimeout = (promise, timeoutMs = 3000) =>
            Promise.race([
                promise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('AsyncStorage timeout')), timeoutMs)
                )
            ]);

        // Serve cache first so the data is instantly available
        try {
            const cached = await withTimeout(AsyncStorage.getItem(contactsCacheKey(userId)));
            if (cached) setEmergencyContacts(JSON.parse(cached));
        } catch (_) {
            // Ignore errors (cache miss or timeout)
        }

        // Background refresh — silently skip if offline (Supabase will fail gracefully)
        try {
            const { data, error } = await supabase
                .from('emergency_contacts')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setEmergencyContacts(data);
                await withTimeout(AsyncStorage.setItem(contactsCacheKey(userId), JSON.stringify(data)));
            }
        } catch (_) {
            // Ignore errors
        }
    }

    async function login(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
    }

    async function register(email, password, metadata={}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        })
        if (error) throw new Error(error.message)
        return data
    }

    async function logout() {
        await supabase.auth.signOut()
        setProfile(null)
        setProfileChecked(false)
        setEmergencyContacts([])
    }

    async function updateProfile(userId, data) {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId)
        if (error) throw new Error(error.message)
        await fetchProfile(userId)
    }

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            if (sessionUser) {
                await fetchProfile(sessionUser.id)
                loadEmergencyContacts(sessionUser.id) // non-blocking
            } else {
                setProfileChecked(true)
            }
            setAuthChecked(true)
        })

        const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (pendingRedirect) return
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            if (sessionUser) {
                await fetchProfile(sessionUser.id)
                loadEmergencyContacts(sessionUser.id) // non-blocking
            } else {
                setProfile(null)
                setProfileChecked(true)
                setEmergencyContacts([])
            }
        })

        const subscription = authListener.data.subscription
        return () => subscription.unsubscribe()
    }, [pendingRedirect])

    return (
        <UserContext.Provider value={{
            user,
            profile,
            profileChecked,
            login,
            register,
            logout,
            authChecked,
            setPendingRedirect,
            updateProfile,
            emergencyContacts,
            setEmergencyContacts,
        }}>
            {children}
        </UserContext.Provider>
    )
}