import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

// show notifications when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// android requires a channel to be set up for sound to work on every notification
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('proximity-alerts', {
        name: 'Proximity Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
    });
}

export function useNotifications() {
    const router = useRouter();
    const listenerRef = useRef(null);
    const lastNotifRef = useRef(null); // tracks last sent incidentId+stage to avoid duplicates

    useEffect(() => {
        // request local notification permission
        Notifications.requestPermissionsAsync().catch(() => {});

        // handle tap — open map zoomed to incident
        listenerRef.current = Notifications.addNotificationResponseReceivedListener(response => {
            const { incidentId } = response.notification.request.content.data ?? {};
            if (incidentId) {
                router.push({ pathname: '/map', params: { alertIncidentId: incidentId } });
            }
        });

        return () => listenerRef.current?.remove();
    }, []);

    async function sendProximityNotification(incident, stage) {
        // don't send duplicate notifications for same incident+stage
        const key = `${incident.id}-${stage}`;
        if (lastNotifRef.current === key) return;
        lastNotifRef.current = key;

        const isUrgent = stage === 2;
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: isUrgent ? '⚠️ Incident Nearby' : '📍 Heads Up',
                    body: isUrgent
                        ? `You are inside the affected zone for a ${incident.severity} severity incident near ${incident.location}.`
                        : `Active ${incident.severity} incident within range of your location.`,
                    data: { incidentId: incident.id },
                    sound: true,
                },
                trigger: null, // fire immediately
            });
        } catch (e) {
            console.log('[notifications] send error:', e.message);
        }
    }

    // reset lastNotifRef when alert is dismissed so next alert can fire
    function resetNotification() {
        lastNotifRef.current = null;
    }

    return { sendProximityNotification, resetNotification };
}