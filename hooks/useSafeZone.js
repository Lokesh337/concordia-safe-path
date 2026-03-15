import { useState, useCallback } from 'react'
import { CONCORDIA_BUILDINGS } from '../constants/Buildings'
import { SEVERITY_RADIUS } from '../constants/Incidents'
import {getDistance} from "../lib/helpers";

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY

function isBuildingInIncidentZone(building, incidents) {
    return incidents.some((incident) => {
        const radius = SEVERITY_RADIUS[incident.severity] ?? 75
        const dist = getDistance(building.latitude, building.longitude, incident.latitude, incident.longitude)
        return dist <= radius
    })
}

function decodePolyline(encoded) {
    const coords = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
        let b
        let shift = 0
        let result = 0

        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        lat += result & 1 ? ~(result >> 1) : result >> 1

        shift = 0
        result = 0

        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        lng += result & 1 ? ~(result >> 1) : result >> 1

        coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 })
    }

    return coords
}

async function fetchRoute(origin, destination) {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=walking&key=${GOOGLE_MAPS_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
        throw new Error(`directions api error: ${data.status}`)
    }

    const encoded = data.routes[0].overview_polyline.points
    return decodePolyline(encoded)
}

export function useSafeZone(userLocation, incidents) {
    const [isActive, setIsActive] = useState(false)
    const [routeCoords, setRouteCoords] = useState([])
    const [targetBuilding, setTargetBuilding] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const activate = useCallback(async (liveLocation = userLocation) => {
        if (!liveLocation) return

        setLoading(true)
        setError(null)

        try {
            // filter out buildings that are inside an incident zone
            const safeBuildings = CONCORDIA_BUILDINGS.filter(
                (b) => !isBuildingInIncidentZone(b, incidents)
            )

            if (safeBuildings.length === 0) {
                throw new Error('no safe buildings found near campus')
            }

            // pick the closest safe building to the user
            const nearest = safeBuildings.reduce((closest, building) => {
                const distToBuilding = getDistance(liveLocation.latitude, liveLocation.longitude, building.latitude, building.longitude)
                const distToClosest = getDistance(liveLocation.latitude, liveLocation.longitude, closest.latitude, closest.longitude)
                return distToBuilding < distToClosest ? building : closest
            })

            const coords = await fetchRoute(liveLocation, nearest)

            setTargetBuilding(nearest)
            setRouteCoords(coords)
            setIsActive(true)
        } catch (e) {
            console.log('[useSafeZone] error:', e.message)
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [userLocation, incidents])

    const deactivate = useCallback(() => {
        setIsActive(false)
        setRouteCoords([])
        setTargetBuilding(null)
        setError(null)
        setLoading(false)
    }, [])

    return { isActive, routeCoords, targetBuilding, loading, error, activate, deactivate }
}