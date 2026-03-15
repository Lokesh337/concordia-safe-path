import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';

// pulsing button with radar waves radiating outward
// shown on the map when the user is inside an incident zone
// props: onPress, label (defaults to find safe zone), color (defaults to red)
export default function PulsingButton({ onPress, label = 'Safe Zone Now', color = Colors.primary?? '#E53935' }) {
    const wave1 = useRef(new Animated.Value(0)).current;
    const wave2 = useRef(new Animated.Value(0)).current;
    const wave3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createWave = (anim, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );

        const a1 = createWave(wave1, 0);
        const a2 = createWave(wave2, 600);
        const a3 = createWave(wave3, 1200);

        a1.start();
        a2.start();
        a3.start();

        // stop all animations on unmount
        return () => {
            a1.stop();
            a2.stop();
            a3.stop();
        };
    }, []);

    // each wave starts at button size, expands to 3.5x and fades out
    const waveStyle = (anim) => ({
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: color,
        transform: [{
            scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.5] }),
        }],
        opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 0.4, 0] }),
    });

    return (
        <View style={styles.wrapper}>
            <Animated.View style={waveStyle(wave1)} />
            <Animated.View style={waveStyle(wave2)} />
            <Animated.View style={waveStyle(wave3)} />
            <TouchableOpacity
                style={[styles.button, { backgroundColor: color, shadowColor: color }]}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <ThemedText style={styles.label}>{label}</ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 32,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 30,
        zIndex: 10,
        elevation: 6,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    label: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});