import { useEffect, useRef, useState, useMemo } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import MapView, { Marker, Circle, Polyline } from 'react-native-maps'
import * as Location from 'expo-location'

import { useIncidents } from '../../hooks/useIncidents'
import { useRoutes } from '../../hooks/useRoutes'
import { useDangerDetection } from '../../hooks/useDangerDetection'

import { CONCORDIA_BUILDINGS } from "../../constants/Buildings"
import { Colors } from "../../constants/Colors"

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedLoader from '../../components/ThemedLoader'
import SearchBar from '../../components/SearchBar'
import RoutesOptions from '../../components/RoutesOptions'
import RouteResultsSheet from '../../components/RouteResultSheet'

const Map = () => {
  const DANGER_RADIUS = 35


  /* STATE */
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [destination, setDestination] = useState(null)
  const [selectedRouteId, setSelectedRouteId] = useState(null)

  const mapRef = useRef(null)


  /* DATA */
  const { incidents } = useIncidents()

  const verifiedIncidents = useMemo(
    () => incidents.filter(i => i.verified),
    [incidents]
  )

  const { routes } = useRoutes(location, destination)
  const safeRoutes = routes


  /*DANGER DETECTION HOOK*/
  const {
    isUserInDangerZone,
    isDestinationInDangerZone,
    isSelectedRouteUnsafe,
  } = useDangerDetection({
    location,
    destination,
    routes,
    selectedRouteId,
    verifiedIncidents,
    dangerRadius: DANGER_RADIUS,
  })


  /*HELPER*/
  const getNearestBuilding = () => {
    if (!location) return null

    let nearest = null
    let minDistance = Infinity

    CONCORDIA_BUILDINGS.forEach(building => {
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


  /*EFFECTs*/

  // Get user location
  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setError('Location permission denied')
        return
      }

      const current = await Location.getCurrentPositionAsync({})
      setLocation(current.coords)
    }

    getLocation()
  }, [])

  // Auto select first route
  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRouteId(routes[0].id)
    }
  }, [routes])

  // Fit map to selected route
  useEffect(() => {
    const selectedRoute = routes.find(r => r.id === selectedRouteId)

    if (!selectedRoute || !mapRef.current) return

    mapRef.current.fitToCoordinates(selectedRoute.coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
      animated: true,
    })
  }, [selectedRouteId, routes])


  /*LOADING / ERROR*/

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


  /*UI*/

  return (
    <ThemedView style={[styles.container, { padding: 0 }]} safe>

      {isUserInDangerZone ? (
        <>
          <View style={styles.warningContainer}>
            <ThemedText style={styles.warningText}>
              ⚠ We suggest staying put to stay safe
            </ThemedText>
          </View>

          <View style={styles.safeButtonContainer}>
            <TouchableOpacity
              style={styles.safeButton}
              onPress={() => {
                const nearest = getNearestBuilding()
                if (nearest) {
                  setDestination({
                    latitude: nearest.latitude,
                    longitude: nearest.longitude,
                  })
                }
              }}
            >
              <ThemedText style={styles.safeButtonText}>
                SAFE ZONE NOW
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      ) : (
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

          <SearchBar onSelect={setDestination} />
        </>
      )}

      <MapView
        ref={mapRef}
        style={[styles.map, StyleSheet.absoluteFillObject]}
        initialRegion={{
          latitude: 45.4948,
          longitude: -73.5772,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsMyLocationButton
        zoomControlEnabled
      >

        {CONCORDIA_BUILDINGS.map((building) => (
          <Marker
            key={building.name}
            coordinate={{
              latitude: building.latitude,
              longitude: building.longitude
            }}
            title={building.name}
          >
            <View style={styles.buildingMarker}>
              <View style={styles.buildingMarkerInner} />
            </View>
          </Marker>
        ))}

        {incidents
          .filter(i => i.latitude && i.longitude)
          .map((incident) => (
            <Marker
              key={incident.id}
              coordinate={{
                latitude: incident.latitude,
                longitude: incident.longitude
              }}
              title={incident.type}
              description={incident.location}
              pinColor={Colors.severity[incident.severity]}
            />
          ))
        }

        {verifiedIncidents.map((incident) => (
          <Circle
            key={`zone-${incident.id}`}
            center={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            radius={DANGER_RADIUS}
            fillColor="rgba(255,0,0,0.25)"
            strokeColor="red"
            strokeWidth={2}
          />
        ))}
        {routes.map((route) => {
  const isSelected = route.id === selectedRouteId

  return (
    <Polyline
      key={route.id}
      coordinates={route.coordinates}
      strokeWidth={isSelected ? 6 : 4}
      strokeColor={isSelected ? "#2ecc71" : "#9CA3AF"}
      zIndex={isSelected ? 2 : 1}
    />
  )
})}

        <RoutesOptions
          routes={safeRoutes.length > 0 ? safeRoutes : routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
        />

      </MapView>

      {!isUserInDangerZone && !isDestinationInDangerZone && isSelectedRouteUnsafe && (
          <View style={styles.routeWarningContainer}>
              <ThemedText style={styles.routeWarningText}>
                  ⚠ This route passes through a danger zone.
              </ThemedText>

              <ThemedText style={styles.routeSubText}>
                {routes.length > 1
                  ? "We recommend choosing an alternative route."
                  : "No safer alternative routes were found. Please stay alert and consider changing your destination."}
              </ThemedText>
          </View>
      )}

      <RouteResultsSheet
        routes={safeRoutes.length > 0 ? safeRoutes : routes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
      />

    </ThemedView>
  )
}

export default Map

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.marker.building,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.marker.building,
  },
  buildingMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.marker.buildingInner,
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

  safeButtonContainer: {
    position: "absolute",
    top: 140,
    alignSelf: "center",
    zIndex: 10,
  },

  safeButton: {
    backgroundColor: "#0077cc",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 6,
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