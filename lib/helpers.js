import { CONCORDIA_BUILDINGS } from '../constants/Buildings'

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

export function getDistance(lat1, lon1, lat2, lon2) {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2))
}

export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}hr ago`
    return `${Math.floor(hrs / 24)}d ago`
}
