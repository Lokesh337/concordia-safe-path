
import {Pressable, StyleSheet, useColorScheme} from "react-native";
import {Colors} from "../constants/Colors";


const ThemedMenuItem = ({onPress, style, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.uiBackground, opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={onPress}
            {...props}
        />


    )
}

export default ThemedMenuItem;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 10,
        marginVertical: 4,
        marginHorizontal: 16,
        alignSelf: 'stretch',
    },
})