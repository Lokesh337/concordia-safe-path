import { useState } from 'react'
import { StyleSheet, Pressable, FlatList, Modal, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'

const ThemedDropdown = ({ value, options, onSelect, placeholder = "Select an option", style }) => {
    const [open, setOpen] = useState(false)
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
            <Pressable
                style={[{ backgroundColor: theme.uiBackground }, styles.selector, style]}
                onPress={() => setOpen(true)}
            >
                <ThemedText style={value ? {} : styles.placeholder}>
                    {value || placeholder}
                </ThemedText>
                <ThemedText>▾</ThemedText>
            </Pressable>

            <Modal visible={open} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <ThemedView style={styles.dropdown}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[
                                        styles.option,
                                        value === item.value && { backgroundColor: Colors.primary + '33' }
                                    ]}
                                    onPress={() => {
                                        onSelect(item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <ThemedText>{item.label}</ThemedText>
                                </Pressable>
                            )}
                        />
                    </ThemedView>
                </Pressable>
            </Modal>
        </>
    )
}

export default ThemedDropdown

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 6,
    },
    placeholder: {
        opacity: 0.4,
    },
    overlay: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'center',
        padding: 40,
    },
    dropdown: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    option: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ffffff22',
    },
})