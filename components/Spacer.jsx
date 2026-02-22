/**
 * A simple invisible spacer used to add vertical (or horizontal) whitespace
 * between elements without reaching for margin/padding on every component.
 */

import { View } from 'react-native';

const Spacer = ({ width = "100%", height = 40 }) => {
    return (
        <View style={{ width, height }} />
    )
}

export default Spacer;