import { useState } from 'react';
import { TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const ThemedTextInput = ({ style, secureTextEntry, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hidden, setHidden] = useState(true);

    const input = (
        <TextInput
            placeholderTextColor={theme.text}
            secureTextEntry={secureTextEntry && hidden}
            autoCapitalize="none"
            style={{
                flex: secureTextEntry ? 1 : undefined,
                backgroundColor: theme.uiBackground,
                color: theme.text,
                padding: 20,
                borderRadius: 6,
            }}
            {...props}
        />
    );

    if (!secureTextEntry) return <TextInput {...{ placeholderTextColor: theme.text, style: [{ backgroundColor: theme.uiBackground, color: theme.text, padding: 20, borderRadius: 6 }, style], ...props }} />;

    return (
        <View style={[{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.uiBackground,
            borderRadius: 6,
        }, style]}>
            {input}
            <TouchableOpacity onPress={() => setHidden(prev => !prev)} style={{ paddingRight: 16 }}>
                <Ionicons
                    name={hidden ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.text}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ThemedTextInput;