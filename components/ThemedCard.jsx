import { StyleSheet, View, useColorScheme} from "react-native";
import { Colors } from '../constants/Colors'
// for tsx, set style as StyleProp?

// wtf is destructuring in js?

// Wwtf are props?
const ThemedCard = ({ style, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View
            style={[{backgroundColor: theme.uiBackground}, styles.card, style]}
            {...props}
        /> // making it self closing avoid having to destructure the children and nesting it wihtin the view
    )
}
export default ThemedCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 5,
        padding: 20
    }
})