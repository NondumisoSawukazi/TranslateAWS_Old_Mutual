import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const ManageScreen = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Manage Screen</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        color: '#004B49',
    },
});

export default ManageScreen;
