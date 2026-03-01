/**
 * Provides global authentication state and auth actions to the entire app.
 *
 *  - user: Supabase User object when logged in, null otherwise.
 *  - authChecked : bolean flag - true once we've received the initial
 *                   response from Supabase. Used for route protectuion
 *  - login() : Signs in with email + password. Throws on failure.
 *  - register() : Creates a new account. Throws on failure.
 *  - logout(): Signs out and clears the session.
 *
 * real-time auth state:
 *  onAuthStateChange() subscribes to Supabase auth events (SIGNED_IN,
 *  SIGNED_OUT, TOKEN_REFRESHED, etc.) and keeps the user state in sync.
 */

import { createContext, useEffect, useState } from 'react'
import { supabase } from "../lib/supabase";

export const UserContext = createContext()

export function UserProvider({ children }) {
    // null  = not logged in (or not yet checked)
    // User  = logged-in Supabase user object
    const [user, setUser] = useState(null)

    // profiles table row for the current user — null until fetched
    const [profile, setProfile] = useState(null)

    // prevents route guards from redirecting before inital session check completes
    const [authChecked, setAuthChecked] = useState(false)

    // when true, auth listener is paused to avoid premature redirects during signup flow
    const [pendingRedirect, setPendingRedirect] = useState(false)

    // fetches the profiles row for a given userId and stores it in state
    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        if (error) {
            console.warn('fetchProfile error:', error.message)
            setProfile(null)
        } else {
            setProfile(data)
        }
    }

    /**
     * Signs in with email + password, throws on failure.
     */
    async function login(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
    }

    /**
     * Creates a new account via supabase signUp.
     * behaviour depends on supabase settings (confirmation email or auto sign-in).
     * metadata is stored in user_metadata and used by the DB trigger to create a profile.
     */
    async function register(email, password, metadata={}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata // stored in user_metadata
            }
        })
        if (error) throw new Error(error.message)
        return data
    }

    /**
     * Signs out from Supabase. onAuthStateChange fires with session = null,
     * which sets user to null and triggers UserOnly to redirect to /login.
     */
    async function logout() {
        await supabase.auth.signOut()
    }

    // updates a user's profile row in the profiles table by id
    async function updateProfile(userId, data) {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId)
        if (error) throw new Error(error.message)
        // refresh local profile so UserOnly re-evaluates preferences_completed immediately
        await fetchProfile(userId)
    }

    useEffect(() => {
        // step 1: grab existing session from storage, mark auth as checked once done
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            if (sessionUser) await fetchProfile(sessionUser.id)
            setAuthChecked(true)
        })

        // step 2: subscribe to future auth changes (login, logout, token refresh, expiry etc.)
        // no need to setAuthChecked here, already handled in getSession above
        const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (pendingRedirect) return // skip update while signup flow is in progress
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            if (sessionUser) {
                await fetchProfile(sessionUser.id)
            } else {
                setProfile(null)
            }
        })

        // grab subscription ref for cleanup
        const subscription = authListener.data.subscription

        // unsubscribe on unmount to avoid memory leaks
        return () => subscription.unsubscribe()
    }, [pendingRedirect])

    return (
        <UserContext.Provider value={{ user, profile, login, register, logout, authChecked, setPendingRedirect, updateProfile }}>
            {children}
        </UserContext.Provider>
    )
}