import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';

const ProfileScreen = () => (
    <View style={styles.container}>
        <Image style={styles.profilePicture} source={{ uri: 'https://via.placeholder.com/120' }} />
        <Text style={styles.profileName}>John Doe</Text>
        <Text style={styles.profileEmail}>johndoe@example.com</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#004B49',
    },
    profileEmail: {
        fontSize: 16,
        color: '#555',
    },
});

export default ProfileScreen;
