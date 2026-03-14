import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { SEVERITY_RADIUS, WARNING_RADIUS } from '../constants/Incidents';

// stage 2 = inside severity radius, stage 1 = within severity radius + WARNING_RADIUS
const RESET_DISTANCE = 500; // how far user needs to walk away before we re-alert

// rough haversine — good enough for campus-scale distances
function getDistance(a, b) {
    const R = 6371000;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    return R * Math.sqrt(dLat * dLat + Math.cos(lat1) * Math.cos(lat2) * dLon * dLon);
}

export function useProximityAlerts(incidents, sendProximityNotification, resetNotification) {
    // maps incident id → last shown stage (1 or 2)
    // ref not state — updating this shouldn't cause re-renders
    const alertedIncidents = useRef(new Map());
    const watchRef = useRef(null);

    // drives the modal — null when nothing to show
    const [activeAlert, setActiveAlert] = useState(null);

    // ref mirrors state so handlePosition can always read current value without stale closure
    const activeAlertRef = useRef(null);
    useEffect(() => {
        activeAlertRef.current = activeAlert;
    }, [activeAlert]);

    // ref to latest handlePosition so the watcher always calls the current version
    // (watcher is only created once but incidents list can change)
    const handlePositionRef = useRef(null);

    function handlePosition(position) {
        const user = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };

        __DEV__ && console.log('[proximity] position update received');

        // build once per callback — makes all id lookups O(1) instead of O(n)
        const incidentMap = new Map(incidents.map(i => [i.id, i]));

        // re-enable alerts for incidents the user has walked far enough away from
        for (const [id] of alertedIncidents.current.entries()) {
            const incident = incidentMap.get(id);
            if (!incident) {
                alertedIncidents.current.delete(id);
                __DEV__ && console.log(`[proximity] incident ${id} resolved, removed from dismissed map`);
                continue;
            }
            const dist = getDistance(user, { latitude: incident.latitude, longitude: incident.longitude });
            __DEV__ && console.log(`[proximity] dismissed incident ${id} — dist from incident: ${dist.toFixed(0)}m (resets at ${RESET_DISTANCE}m)`);
            if (dist > RESET_DISTANCE) {
                alertedIncidents.current.delete(id);
                __DEV__ && console.log(`[proximity] incident ${id} reset — user moved far enough away`);
            }
        }

        // find the closest incident that qualifies for an alert
        let closest = null;
        let closestDistance = Infinity;

        for (const incident of incidents) {
            const dist = getDistance(user, {
                latitude: incident.latitude,
                longitude: incident.longitude,
            });

            const severityRadius = SEVERITY_RADIUS[incident.severity] ?? 100;
            const stage = dist <= severityRadius ? 2 : dist <= severityRadius + WARNING_RADIUS ? 1 : null;

            __DEV__ && console.log(`[proximity] incident ${incident.id} (${incident.severity}) — dist: ${dist.toFixed(0)}m, severityRadius: ${severityRadius}m, stage1threshold: ${severityRadius + WARNING_RADIUS}m, stage: ${stage}`);

            if (stage === null) continue;

            // skip if we've already shown this stage or higher for this incident
            const shownStage = alertedIncidents.current.get(incident.id);
            if (shownStage !== undefined && stage <= shownStage) {
                __DEV__ && console.log(`[proximity] skipping incident ${incident.id} — already shown stage ${shownStage}`);
                continue;
            }

            if (dist < closestDistance) {
                closest = { incident, stage };
                closestDistance = dist;
            }
        }

        __DEV__ && console.log('[proximity] closest qualifying incident:', closest ? `${closest.incident.id} stage ${closest.stage}` : 'none');

        if (closest) {
            const prev = activeAlertRef.current;
            __DEV__ && console.log(`[proximity] prev: ${prev ? `incident ${prev.incident.id} stage ${prev.stage}` : 'null'}, new: stage ${closest.stage}`);

            // already showing this exact incident+stage — do nothing
            if (prev?.incident?.id === closest.incident.id && prev.stage === closest.stage) {
                __DEV__ && console.log('[proximity] same incident+stage already showing, skipping');
                return;
            }
            // don't downgrade a stage 2 to stage 1
            if (prev && prev.stage > closest.stage) {
                __DEV__ && console.log('[proximity] keeping existing higher-stage alert');
                return;
            }

            __DEV__ && console.log(`[proximity] setting alert → stage ${closest.stage}`);
            // record immediately so rapid position updates don't re-trigger before user dismisses
            alertedIncidents.current.set(closest.incident.id, closest.stage);
            setActiveAlert(closest);
            sendProximityNotification?.(closest.incident, closest.stage);
        }
    }

    // keep ref pointing at latest handlePosition on every render
    handlePositionRef.current = handlePosition;

    useEffect(() => {
        let active = true;

        async function startWatcher() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                __DEV__ && console.log('[proximity] location permission status:', status);
                if (status !== 'granted' || !active) return;

                if (!active) return;

                __DEV__ && console.log('[proximity] starting watcher...');
                watchRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.BestForNavigation,
                        distanceInterval: 10,
                    },
                    (pos) => handlePositionRef.current(pos)
                );
                __DEV__ && console.log('[proximity] watcher started');
            } catch (e) {
                __DEV__ && console.log('[proximity] watcher error:', e.message);
            }
        }

        startWatcher();

        return () => {
            __DEV__ && console.log('[proximity] cleaning up watcher');
            active = false;
            watchRef.current?.remove();
        };
    }, []);

    function dismissAlert() {
        if (!activeAlert) return;
        // stage already recorded on show — this ensures it's set even if somehow missed
        alertedIncidents.current.set(activeAlert.incident.id, activeAlert.stage);
        // reset push notification dedup key so it can re-fire if user re-enters the zone
        resetNotification?.();
        setActiveAlert(null);
    }

    return { activeAlert, dismissAlert };
}