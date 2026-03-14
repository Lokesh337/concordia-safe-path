import { useEffect, useRef, useState } from "react"
import {StyleSheet, View, TouchableOpacity, Keyboard} from 'react-native'
import PulsingButton from '../../components/PulsingButton'
import MapView, { Marker, Circle, Polyline, Polygon } from "react-native-maps"
import * as Location from "expo-location"

import { useIncidents } from "../../hooks/useIncidents"
import { useRoutes } from "../../hooks/useRoutes"
import { useDangerDetection } from "../../hooks/useDangerDetection"

import { CONCORDIA_BUILDINGS, SGW_CAMPUS_BOUNDARY, GUY_METRO } from '../../constants/Buildings'
import { Colors } from '../../constants/Colors'
import { SEVERITY_RADIUS } from '../../constants/Incidents'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedLoader from '../../components/ThemedLoader'
import SearchBar from '../../components/SearchBar'
import RoutesOptions from '../../components/RoutesOptions'
import RouteResultsSheet from '../../components/RouteResultSheet'
import { useLocalSearchParams } from 'expo-router';
import {getDistance} from "../../lib/helpers";


const BUILDING_MARKER = require('../../assets/building_marker.png')

const Map = () => {

  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [selectedIncidentId, setSelectedIncidentId] = useState(null)
  const [destination, setDestination] = useState(null)
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [safeZoneMessage, setSafeZoneMessage] = useState(null)
  const [navigatingToSafety, setNavigatingToSafety] = useState(false)
  const [routesDismissed, setRoutesDismissed] = useState(false)
  const originSnapshot = useRef(null)
  const mapRef = useRef(null)

  const { incidents } = useIncidents()
  const { routes } = useRoutes(navigatingToSafety ? originSnapshot.current : location, destination)

  const { alertIncidentId: _alertIncidentId } = useLocalSearchParams()
  const alertIncidentId = Array.isArray(_alertIncidentId) ? _alertIncidentId[0] : _alertIncidentId

  const {
    isUserInDangerZone,
    isDestinationInDangerZone,
    isSelectedRouteUnsafe,
  } = useDangerDetection({
    location,
    destination,
    routes,
    selectedRouteId,
    verifiedIncidents: incidents,
    dangerRadius: SEVERITY_RADIUS,
  })

  const getNearestBuilding = () => {
    if (!location) return null
    let nearest = null
    let minDistance = Infinity
    CONCORDIA_BUILDINGS.forEach((building) => {
      const inDanger = incidents.some((incident) => {
        if (!incident.latitude || !incident.longitude) return false
        const dist = getDistance(
            building.latitude,
            building.longitude,
            incident.latitude,
            incident.longitude
        )
        return dist < (SEVERITY_RADIUS[incident.severity] ?? 75)
      })
      if (inDanger) return
      const distance =
          Math.pow(location.latitude - building.latitude, 2) +
          Math.pow(location.longitude - building.longitude, 2)
      if (distance < minDistance) {
        minDistance = distance
        nearest = building
      }
    })
    return nearest
  }

// watch user location so danger detection stays current
  useEffect(() => {
    let watcher = null

    async function startWatcher() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied')
        return
      }
      watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 10,
          },
          (pos) => setLocation(pos.coords)
      )
    }

    startWatcher()

    return () => watcher?.remove()
  }, [])

  // center on campus on mount
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.animateToRegion({
      latitude: GUY_METRO.latitude,
      longitude: GUY_METRO.longitude,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    }, 0)
  }, [])

  // zoom to incident when arriving from proximity alert modal
  useEffect(() => {
    if (!alertIncidentId || !mapRef.current) return
    const incident = incidents.find(i => i.id === alertIncidentId)
    if (!incident) return
    mapRef.current.animateToRegion({
      latitude: incident.latitude,
      longitude: incident.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    }, 600)
  }, [alertIncidentId, incidents])

  // zoom to incident when tapping a marker
  useEffect(() => {
    if (!selectedIncidentId || !mapRef.current) return
    const incident = incidents.find(i => i.id === selectedIncidentId)
    if (!incident) return
    mapRef.current.animateToRegion({
      latitude: incident.latitude,
      longitude: incident.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    }, 600)
  }, [selectedIncidentId, incidents])

  // auto-select first route when routes load
  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRouteId(routes[0].id)
    }
  }, [routes])

  // fit map to selected route
  useEffect(() => {
    const selectedRoute = routes.find((r) => r.id === selectedRouteId)
    if (!selectedRoute || !mapRef.current) return
    mapRef.current.fitToCoordinates(selectedRoute.coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
      animated: true,
    })
  }, [selectedRouteId, routes])

  // clear state when out of danger zone
  useEffect(() => {
    if (!isUserInDangerZone && !navigatingToSafety) {
      setDestination(null)
      setSafeZoneMessage(null)
    }
  }, [isUserInDangerZone])


  if (error) {
    return (
        <ThemedView style={styles.center}>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
    )
  }

  if (!location) {
    return (
        <ThemedView style={styles.center}>
          <ThemedLoader />
        </ThemedView>
    )
  }

  return (
      <ThemedView style={[styles.container, { padding: 0 }]} safe={true}>

        {(isUserInDangerZone || navigatingToSafety) && (
            <>
              {safeZoneMessage && !navigatingToSafety && (
                  <View style={styles.warningContainer}>
                    <ThemedText style={styles.warningText}>
                      {safeZoneMessage}
                    </ThemedText>
                  </View>
              )}
              {navigatingToSafety ? (
                  __DEV__ && console.log('[map] rendering I AM SAFE NOW') ||
                  <TouchableOpacity
                      style={styles.safeZoneButton}
                      onPress={() => {
                        setDestination(null)
                        setNavigatingToSafety(false)
                        setSafeZoneMessage(null)
                        setSelectedRouteId(null)
                        setRoutesDismissed(true)
                      }}
                      activeOpacity={0.85}
                  >
                    <ThemedText style={styles.safeZoneButtonText}>I AM SAFE NOW</ThemedText>
                  </TouchableOpacity>
              ) : (
                  <PulsingButton
                      label="SAFE ZONE NOW"
                      onPress={() => {
                        const nearest = getNearestBuilding()
                        if (nearest) {
                          originSnapshot.current = location
                          setDestination({ latitude: nearest.latitude, longitude: nearest.longitude })
                          setNavigatingToSafety(true)
                          setRoutesDismissed(false)

                        } else {
                          setSafeZoneMessage('⚠ All nearby buildings are in a danger zone. Please stay put.')
                        }
                      }}
                  />
              )}
            </>
        )}
        {!isUserInDangerZone && (
            <>
              {isDestinationInDangerZone && (
                  <View style={styles.destinationWarningContainer}>
                    <ThemedText style={styles.destinationWarningText}>
                      ⚠ This destination is inside a reported danger zone.
                    </ThemedText>
                    <ThemedText style={styles.destinationSubText}>
                      We recommend choosing an alternative location.
                    </ThemedText>
                  </View>
              )}
              <SearchBar // in SearchBar onSelect handler in map.jsx
                  onSelect={(dest) => {
                    setDestination(dest)
                    setRoutesDismissed(false)
                  }}
                  onClear={() => setDestination(null)} />
            </>
        )}


        {/* MAP */}
        <MapView
            ref={mapRef}
            style={[styles.map, StyleSheet.absoluteFillObject]}
            initialRegion={{
              latitude: GUY_METRO.latitude,
              longitude: GUY_METRO.longitude,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            }}
            showsUserLocation={true}
            showsPointsOfInterest={false}
            showsBuildings={false}
            showsMyLocationButton={true}
            zoomControlEnabled={true}
            onPress={() => {
              setSelectedIncidentId(null)
              Keyboard.dismiss()
            }}        >
          {CONCORDIA_BUILDINGS.map((building) => (
              <Marker
                  key={building.name}
                  coordinate={{ latitude: building.latitude, longitude: building.longitude }}
                  title={building.name}
                  image={BUILDING_MARKER}
              />
          ))}

          {incidents
              .filter((i) => i.latitude && i.longitude)
              .map((incident) => (
                  <Marker
                      onPress={() => setSelectedIncidentId(incident.id)}
                      key={incident.id}
                      coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
                      title={incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                      description={incident.location}
                      pinColor={Colors.severity[incident.severity]}
                  />
              ))
          }

          {/* circle only on tapped or alerted incident */}
          {incidents
              .filter((i) => i.latitude && i.longitude && (i.id === selectedIncidentId || i.id === alertIncidentId))
              .map((incident) => (
                  <Circle
                      key={`circle-${incident.id}`}
                      center={{ latitude: incident.latitude, longitude: incident.longitude }}
                      radius={SEVERITY_RADIUS[incident.severity] ?? 75}
                      fillColor={`${Colors.severity[incident.severity]}33`}
                      strokeColor={Colors.severity[incident.severity]}
                      strokeWidth={1}
                  />
              ))
          }

          <Polygon
              coordinates={SGW_CAMPUS_BOUNDARY}
              fillColor={`${Colors.primary}22`}
              strokeColor={Colors.primary}
              strokeWidth={2}
          />

          {!routesDismissed && (navigatingToSafety ? (
              <RoutesOptions
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
              />
          ) : (
              !isUserInDangerZone &&
                  <RoutesOptions
                      routes={routes}
                      selectedRouteId={selectedRouteId}
                      onSelectRoute={setSelectedRouteId}
                  />

          ))}
        </MapView>


        {/* TODO: route warning — uncomment when ready to enable
            {!isUserInDangerZone && !isDestinationInDangerZone && isSelectedRouteUnsafe && (
                <View style={styles.routeWarningContainer}>
                    <ThemedText style={styles.routeWarningText}>
                        ⚠ This route passes through a danger zone.
                    </ThemedText>
                    <ThemedText style={styles.routeSubText}>
                        {routes.length > 1
                            ? 'We recommend choosing an alternative route.'
                            : 'No safer alternative routes were found. Please stay alert and consider changing your destination.'}
                    </ThemedText>
                </View>
            )}
            */}


      {/* ROUTE SHEET */}

      {!isUserInDangerZone && !navigatingToSafety && routes.length > 0 && !routesDismissed && (
          <RouteResultsSheet
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            onDismiss={() => setRoutesDismissed(true)}
        />
      )}
    </ThemedView>
  )
}

export default Map


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  warningContainer: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "#FFF3CD",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    zIndex: 11,
  },

  warningText: {
    color: "#B45309",
    fontWeight: "bold",
    textAlign: "center",
  },

  safeZoneButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    zIndex: 20,
    shadowColor: '#27ae60',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  safeZoneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  safeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  destinationWarningContainer: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    zIndex: 11,
  },

  destinationWarningText: {
    color: "#B91C1C",
    fontWeight: "bold",
    textAlign: "center",
  },

  destinationSubText: {
    color: "#7F1D1D",
    textAlign: "center",
    marginTop: 4,
  },

  routeWarningContainer: {
    position: "absolute",
    bottom: 260,
    alignSelf: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    zIndex: 20,
  },

  routeWarningText: {
    color: "#B91C1C",
    fontWeight: "bold",
    textAlign: "center",
  },

  routeSubText: {
    color: "#7F1D1D",
    textAlign: "center",
    marginTop: 4,
  },
})