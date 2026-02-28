/**
 * Provides global authentication state and auth actions to the entire app.
 *
 * Sstored in context:
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

    // Prevents route protection from redirecting before the initial session
    // check completes.
    const [authChecked, setAuthChecked] = useState(false)

    const [pendingRedirect, setPendingRedirect] = useState(false)

    /**
     * Calls Supabase signInWithPassword.
     */
    async function login(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
    }

    /**
     * Calls Supabase signUp. Behaviour depends on Supabase settings: confirmation email or not
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

    async function updateProfile(userId, data) {
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId)
        if (error) throw new Error(error.message)
    }

    useEffect(() => {
        // Step 1: Fetch the existing session from localStorage
        // setAuthChecked(true) is called here so guards know the check is done.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setAuthChecked(true)
        })

        // Step 2: Subscribe to all future auth state changes.
        // This handles: login, logout, token refresh, session expiry, etc.
        // We don't need to call setAuthChecked here because it was already
        // set to true in the getSession() callback above.
        const authListener = supabase.auth.onAuthStateChange((_event, session) => {
            if (pendingRedirect) return
            setUser(session?.user ?? null)
        })

        // Grab the subscription object to clean up on unmount
        const subscription = authListener.data.subscription

        // Unsubscribe when the provider unmounts to prevent memory leaks
        return () => subscription.unsubscribe()
    }, [pendingRedirect]) // Empty deps, only run once on mount

    return (
        <UserContext.Provider value={{ user, login, register, logout, authChecked, setPendingRedirect  }}>
            {children}
        </UserContext.Provider>
    )
}