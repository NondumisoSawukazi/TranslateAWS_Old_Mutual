// NotificationsScreen.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const NotificationsScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Notifications Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default NotificationsScreen;
