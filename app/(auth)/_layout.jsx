/**
 * Layout wrapper for all authentication screens (login, register).
 *
 *  - Wraps auth screens in <GuestOnly>,  redirects already-logged-in
 *    users away to the dashboard before they ever see this layout.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import GuestOnly from "../../components/auth/GuestOnly";

const AuthLayout = () => {

    return (
        // GuestOnly redirects authenticated users to /incidents.
        <GuestOnly>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerShown: false,  // No nav header on any auth screen
                    animation: "none",   // Instant transition between login and register
                }}
            />
        </GuestOnly>
    )
}

export default AuthLayout;