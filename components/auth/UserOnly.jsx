/**
 * Route protection that only renders its children for authenticated users.
 *
 *  - While auth state is loading (authChecked = false), shows a spinner
 *    to avoid flashing the dashboard to a user who isn't logged in.
 *  - Once auth is confirmed AND user is null (not logged in), redirects
 *    to /login using router.replace() so the protected screen is removed
 *    from the stack — the user cannot go back to the dashboard from login.
 *  - Only renders children when a valid session is confirmed.
 */

import { useUser } from "../../hooks/useUser";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

const UserOnly = ({ children }) => {
    const { user, authChecked } = useUser()
    const router = useRouter()

    useEffect(() => {
        // Only redirect after authChecked = true to avoid redirecting
        // during the initial loading phase when user is still null
        if (authChecked && user === null) {
            router.replace("/login")
        }
    }, [user, authChecked])

    // Show spinner in two cases:
    //  1. authChecked is false → still waiting on Supabase getSession()
    //  2. user is null: redirect to /login is queued but hasn't fired yet
    if (!authChecked || !user) {
        return <ThemedLoader />
    }

    // Session confirmed: safe to render the protected screen
    return children
}

export default UserOnly