import { StyleSheet } from 'react-native'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'

const Routes = () => {
    return (
        <ThemedView style={[styles.container, {margin: 0, padding:0}]} safe={true}>
            <ThemedText title={true}>Routes Page</ThemedText>
            <Spacer />
        </ThemedView>
    )
}

export default Routes

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

})