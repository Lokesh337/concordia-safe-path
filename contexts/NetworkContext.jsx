import { createContext, useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { supabase } from '../lib/supabase'

export const NetworkContext = createContext()

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(null) // null = unknown, true = online, false = offline

    useEffect(() => {
        NetInfo.fetch().then(state => {
            setIsOnline(!!state.isConnected && state.isInternetReachable !== false)
        })

        const unsubscribe = NetInfo.addEventListener(state => {
            const online = !!state.isConnected && state.isInternetReachable !== false
            setIsOnline(online)

            // pause/resume Supabase JWT auto-refresh based on connectivity
            // prevents [TypeError: Network request failed] flood when offline
            if (online) {
                supabase.auth.startAutoRefresh()
            } else {
                supabase.auth.stopAutoRefresh()
            }
        })
        return () => unsubscribe()
    }, [])

    return (
        <NetworkContext.Provider value={{ isOnline }}>
            {children}
        </NetworkContext.Provider>
    )
}