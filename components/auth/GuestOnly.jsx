/**
 * Route protection that only renders its children for unauthenticated users.
 *
 *  - While auth state is being determined (authChecked = false), renders
 *    a full-screen loading spinner.
 *  - Once auth is confirmed AND a user is logged in, redirects to /incidents.
 *    The redirect uses router.replace() so the auth screen is removed from
 *    the navigation stack — pressing back from the dashboard won't return
 *    to login.
 *  - Only renders children when we're sure the user is NOT logged in.
 */

import { useRouter } from "expo-router";
import { useEffect } from "react";

//hooks
import { useUser } from "../../hooks/useUser";

import ThemedLoader from "../ThemedLoader";

const GuestOnly = ({ children }) => {
    const { user, authChecked } = useUser()
    const router = useRouter()

    useEffect(() => {
        // Only redirect once we've confirmed the user is logged in.
        if (authChecked && user !== null) {
            router.replace("/incidents")
        }
    }, [user, authChecked])

    // Show spinner in two cases:
    //  1. authChecked is false: still waiting on Supabase getSession()
    //  2. user is not null: redirect is queued but hasn't fired yet
    if (!authChecked || user) {
        return <ThemedLoader />
    }

    // Auth is confirmed and user is null, safe to show the auth screen
    return children
}

export default GuestOnly