import {createContext, useEffect, useState} from 'react'
import {supabase} from "../lib/supabase";

export const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [authChecked, setAuthChecked] = useState(false)

    async function login(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
    }

    async function register(email, password) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw new Error(error.message)
    }

    async function logout() {
        await supabase.auth.signOut()
    }

    // async function login(email, password) {
    //     try {
    //         // await account.createEmailPasswordSession(email, password)
    //         await supabase.auth.signInWithPassword({ email, password })
    //         const response = await account.get()
    //         setUser(response)
    //
    //     } catch (error){
    //         throw new Error(error.message)
    //     }
    // }
    //
    // async function register(email, password) {
    //     try {
    //         // await account.create( ID.unique(), email, password)
    //         await supabase.auth.signUp({ email, password })
    //         // await login(email, password) // needed?
    //     } catch (error){
    //         throw new Error(error.message)
    //     }
    // }
    //
    // async function logout() {
    //     // await account.deleteSession("current")
    //     await supabase.auth.signOut()
    //     setUser(null)
    // }

    useEffect(() => {



        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setAuthChecked(true)
        })

        const authListener = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        const subscription = authListener.data.subscription

        return () => subscription.unsubscribe()

    }, [])

    // async function getInitialUserValue(){
    //     try{
    //         const response = await account.get()
    //         setUser(response)
    //     }catch(error){
    //         setUser(null)
    //     } finally {
    //         setAuthChecked(true)
    //     }
    // }
    //
    // useEffect(() => {
    //     getInitialUserValue()
    // }, [])

    return (
        <UserContext.Provider value={{ user, login, register, logout, authChecked}}>
            { children }
        </UserContext.Provider>
    )
}