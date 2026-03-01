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
    const { user, profile, profileChecked, authChecked } = useUser()
    const router = useRouter()

    useEffect(() => {
        // Only redirect after authChecked = true to avoid redirecting
        // during the initial loading phase when user is still null
        if (authChecked && user === null) {
            router.replace("/login")
        }

        // first-time users haven't completed preferences yet — send them there first
        if (authChecked && profileChecked && user && profile && !profile.preferences_completed) {
            router.replace("/menu/preferences")
        }
    }, [user, profile, profileChecked, authChecked])

    // Show spinner until both auth and profile checks are complete
    if (!authChecked || !profileChecked) {
        return <ThemedLoader />
    }

    // redirect to login is queued but hasn't fired yet
    if (!user) {
        return <ThemedLoader />
    }

    // Session confirmed: safe to render the protected screen
    return children
}

export default UserOnly