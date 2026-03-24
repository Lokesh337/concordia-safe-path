import { useContext } from 'react'
import { NetworkContext } from '../contexts/NetworkContext'
import NetInfo from "@react-native-community/netinfo";

export function useNetwork() {
    const context = useContext(NetworkContext)
    if (!context) throw new Error('useNetwork must be used within a NetworkProvider')
    // Fresh point-in-time connectivity check.
    // Use this before any user-triggered write action instead of relying on
    // the isOnline state value, which can be stale by the time the handler fires.
    const checkOnline = async () => {
        const state = await NetInfo.fetch()
        return !!state.isConnected && state.isInternetReachable !== false
    }
    return { ...context, checkOnline }
}