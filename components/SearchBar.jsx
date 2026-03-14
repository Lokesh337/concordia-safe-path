import React, { useRef, useState } from "react";
import {View, TouchableOpacity, Keyboard} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Ionicons } from "@expo/vector-icons";
import { SEARCH_LOCATIONS } from "../constants/SearchBarLocations";
import { Colors } from "../constants/Colors";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY

const SearchBar = ({ onSelect, onClear }) => {
  const ref = useRef(null)
  const [hasText, setHasText] = useState(false)

  // convert buildings into google predefined format
  const campusPlaces = SEARCH_LOCATIONS.map((location) => ({
    description: location.name,
    geometry: {
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
    },
  }));

  const handleClear = () => {
    ref.current?.clear()
    ref.current?.blur()
    setHasText(false)
    onClear?.()
  }

  return (
      <View style={{ width: "100%", zIndex: 20, marginTop: 0}}>
        <View style={{ position: "relative" }}>
          <GooglePlacesAutocomplete
              ref={ref}
              placeholder="Search any address"
              fetchDetails={true}
              debounce={200}
              minLength={1}
              enablePoweredByContainer={false}
              keepResultsAfterBlur={false}
              textInputProps={{
                onChangeText: (text) => setHasText(text.length > 0),
                onBlur: () => {
                  Keyboard.dismiss()
                  setHasText(false)
                },
              }}

        /* 🔹 When user selects GOOGLE result */
        onPress={(data, details = null) => {
          if (!details) return;

          const location = details.geometry.location;

          onSelect({
            latitude: location.lat,
            longitude: location.lng,
          });
        }}

        // /* 🔹 Your default campus buildings */
        // predefinedPlaces={campusPlaces}
        //
        // /* 🔹 When user selects DEFAULT building */
        // onPressPredefined={(place) => {
        //   onSelect({
        //     latitude: place.geometry.location.lat,
        //     longitude: place.geometry.location.lng,
        //   });
        // }}

        query={{
          key: GOOGLE_API_KEY,
          language: "en",
          components: "country:ca",
          location: "45.495,-73.578",
          radius: 1500,
        }}

              styles={{
                container: { flex: 0, marginBottom: 0 },
                textInput: {
                  // marginHorizontal: 16,
                  height: 50,
                  paddingHorizontal: 15,
                  paddingRight: 45,
                  backgroundColor: "white",
                },
                listView: {
                  position: 'absolute',
                  top: 50,
                  left: 0,
                  right: 0,
                  borderRadius: 12,
                  backgroundColor: "white",
                  elevation: 4,
                  zIndex: 50,

                },
                row: {
                  paddingHorizontal: 15,
                },
              }}
          />
          <TouchableOpacity
              onPress={hasText ? handleClear : undefined}
              style={{ position: "absolute", right: 28, top: 13, zIndex: 30, padding: 4 }}
          >
            <Ionicons
                name={hasText ? "close-circle" : "search"}
                size={22}
                color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
  );
};

export default SearchBar;