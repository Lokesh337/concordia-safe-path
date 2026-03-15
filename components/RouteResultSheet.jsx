import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

const RouteResultsSheet = ({ routes, selectedRouteId, onSelectRoute, onDismiss }) => {
  if (!routes || routes.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Available Safe Paths</Text>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {routes.map((route, index) => {
          const isSelected = route.id === selectedRouteId;

          return (
            <TouchableOpacity
              key={route.id}
              style={[styles.routeItem, isSelected && styles.selectedRoute]}
              onPress={() => onSelectRoute(route.id)}
            >
              <Text style={styles.routeTitle}>
                Path {index + 1}
              </Text>
              <Text style={styles.routeDetails}>
                {route.duration} • {route.distance}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default RouteResultsSheet;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dismiss: {
    fontSize: 16,
    color: "#555",
    padding: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
  },
  routeItem: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  selectedRoute: {
    backgroundColor: "#d6f5e3",
    borderWidth: 1,
    borderColor: "#2ecc71",
  },
  routeTitle: {
    fontWeight: "600",
  },
  routeDetails: {
    marginTop: 4,
    color: "#555",
  },
});