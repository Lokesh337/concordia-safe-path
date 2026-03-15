import { Platform, View } from 'react-native';
import MapView from 'react-native-maps';
import { useState, useEffect } from 'react';

// android's native location manager only activates when something requests it at the OS level
// showsUserLocation on a hidden MapView does this without hanging like getCurrentPositionAsync
// this lets useProximityAlerts receive updates immediately without visiting the map page
// delayed mount so it doesn't interfere with initial data loading
export default function LocationWakeup() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // wait for first render cycle to complete before mounting the MapView
        const t = setTimeout(() => setReady(true), 1000);
        return () => clearTimeout(t);
    }, []);

    if (Platform.OS !== 'android' || !ready) return null;

    return (
        <View style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} pointerEvents="none">
            <MapView
                style={{ width: 1, height: 1 }}
                showsUserLocation={true}
            />
        </View>
    );
}