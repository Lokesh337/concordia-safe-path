import { createContext, useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'

export const NetworkContext = createContext()

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // initial check
        NetInfo.fetch().then(state => {
            setIsOnline(state.isConnected && state.isInternetReachable !== false)
        })

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected && state.isInternetReachable !== false)
        })
        return () => unsubscribe()
    }, [])

    return (
        <NetworkContext.Provider value={{ isOnline }}>
            {children}
        </NetworkContext.Provider>
    )
}