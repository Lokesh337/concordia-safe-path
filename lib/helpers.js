/**
 * General-purpose utility functions used across the app.
 */

import { CONCORDIA_BUILDINGS } from '../constants/Buildings'

/**
 * Given a coordinate, finds the closest Concordia building from the
 * static buildings list and returns a human-readable label.
 *
 * Used by: IncidentCard to display a location name instead of raw coordinates.
 *
 * Uses Euclidean distance on raw lat/lng degrees.
 *
 * IMPORTANT LIMITATION: This is NOT true geographic distance.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} e.g. "Near Hall Building" or "Unknown location"
 */
export function getNearestBuilding(latitude, longitude) {
    let nearest = null
    let minDistance = Infinity

    CONCORDIA_BUILDINGS.forEach((building) => {
        const distance = Math.sqrt(
            Math.pow(building.latitude - latitude, 2) +
            Math.pow(building.longitude - longitude, 2)
        )
        if (distance < minDistance) {
            minDistance = distance
            nearest = building
        }
    })

    return nearest ? `Near ${nearest.name}` : 'Unknown location'
}

/**
 * getDistance(lat1, lon1, lat2, lon2)
 *
 * Returns the Euclidean distance between two lat/lng coordinates.
 *
 * Used by: incidents.jsx to sort the incident list by proximity to the user.
 *
 * TODO (Goal 4): When showing "X metres from safe zone", replace this with
 * a proper distance (Haversine?) so the displayed distance is accurate.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Approximate distance
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2))
}

/**
 * Converts an ISO date string into a short human-readable relative time label.
 *
 * Used by: IncidentCard to show how long ago an incident was reported.
 *
 * Examples:
 *   "3 min ago"
 *   "2hr ago"
 *   "1d ago"
 *
 * TODO: Handle edge cases — e.g. "just now" for < 1 min, or localization
 *
 * @param {string} dateStr
 * @returns {string}
 */
export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}hr ago`
    return `${Math.floor(hrs / 24)}d ago`
}