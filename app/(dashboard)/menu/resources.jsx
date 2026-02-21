import { StyleSheet } from 'react-native'

import Spacer from "../../../components/Spacer"
import ThemedText from "../../../components/ThemedText"
import ThemedView from "../../../components/ThemedView"

const Resources = () => {

    return (
        <ThemedView style={styles.container} safe = {true} >

            <ThemedText title={true}>Emergency Resources Page</ThemedText>
            <Spacer />


        </ThemedView>
    )
}

export default Resources

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

})