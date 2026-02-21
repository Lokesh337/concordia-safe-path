import {createContext, useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'
import {useUser} from "../hooks/useUser";


const TABLE = 'incidents'


export const IncidentsContext = createContext()

export function IncidentsProvider({ children }) {
    const [incidents, setIncidents] = useState([])
    const { user } = useUser()

    async function fetchIncidents() {
        if (!user?.id) return
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .select('*')
            setIncidents(data)

        } catch (error) {
            console.log('fetchIncidents:', error.message)
        }
    }

    async function fetchIncidentById(id){
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .select('*')
                .eq('id', id)
                .single()

            return data
        } catch (error) {
            console.log('fetchIncidentById:', error.message)
        }
    }

    async function createIncident(data) {
        try {
            const { error } = await supabase
                .from(TABLE)
                .insert({ ...data, user_id: user.id })
            if (error) throw new Error(error.message)  // add this
        } catch (error) {
            console.log('createIncident:', error.message)
        }
    }

    // async function deleteBook(id) {
    //     try {
    //         const { error } = await supabase
    //             .from(TABLE)
    //             .delete()
    //             .eq('id', id)
    //
    //     } catch (error) {
    //         console.log('deleteBook:', error.message)
    //     }
    // }

    useEffect(() => {
        if (!user?.id) {
            setIncidents([])
            return
        }

        fetchIncidents()

        const channel = supabase
            .channel('incidents-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: TABLE },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setIncidents((prev) => [...prev, payload.new])
                    }

                    if (payload.eventType === 'UPDATE') {
                        setIncidents((prev) => prev.map((b) => b.id === payload.new.id ? payload.new : b))
                    }
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user])

    return (
        <IncidentsContext.Provider value={{ incidents, fetchIncidents, fetchIncidentById, createIncident }}>
            { children }
        </IncidentsContext.Provider>
    )
}