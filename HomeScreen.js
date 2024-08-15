// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, FlatList, Image, TextInput, Button, ScrollView, Modal } from 'react-native';
import AWS from 'aws-sdk';
import { useLanguage } from './LanguageContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.Credentials('AKIAXYKJWQPXKSAPL65K', 'B0C1IMYKGadHannXCNrgeIBJwmtDAF/VUnWMg5nX'),
});

const lexruntime = new AWS.LexRuntimeV2();  // Updated to LexRuntimeV2
const botId = 'FXNXT7ABHO';  // Replace with your Bot ID
const botAliasId = '2JWA77FZT5';  // Replace with your Bot Alias ID
const localeId = 'en_US';  // Replace with your Locale ID
const userId = 'user-' + Math.random();

const translateText = async (text, targetLanguage) => {
    try {
        const translate = new AWS.Translate();
        const params = {
            SourceLanguageCode: 'en',
            TargetLanguageCode: targetLanguage,
            Text: text,
        };

        const result = await translate.translateText(params).promise();
        return result.TranslatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return text;
    }
};

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
    const { language, setLanguage } = useLanguage();
    const [translations, setTranslations] = useState({});
    const [fadeAnim] = useState(new Animated.Value(0));
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('Hello');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchTranslations = async () => {
            const textsToTranslate = {
                home: 'Home Screen',
                goToLogin: 'Go to Login',
            };

            const translatedTexts = await Promise.all(
                Object.entries(textsToTranslate).map(async ([key, text]) => {
                    const translatedText = await translateText(text, language);
                    return [key, translatedText];
                })
            );

            setTranslations(Object.fromEntries(translatedTexts));
        };

        fetchTranslations();
    }, [language]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleSend = async () => {
        const newMessage = { text: userInput, sender: 'user' };
        setMessages([...messages, newMessage]);

        const params = {
            botId: botId,
            botAliasId: botAliasId,
            localeId: localeId,
            text: userInput,
            sessionId: userId,
        };

        try {
            const data = await lexruntime.recognizeText(params).promise();
            console.log('Data received from Lex:', JSON.stringify(data));

            const botMessageText = data.requestAttributes && data.requestAttributes['x-amz-lex:qnA-search-response'] ? 
                data.requestAttributes['x-amz-lex:qnA-search-response'] : 'No response from bot';
            
            const botMessage = { text: botMessageText, sender: 'bot' };

            setMessages([...messages, newMessage, botMessage]);
        } catch (err) {
            console.error('Error from Lex:', err);
        } finally {
            setUserInput('');
        }
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        setModalVisible(false);
    };

    return (
        <NavigationContainer independent={true}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        switch (route.name) {
                            case 'Home':
                                iconName = 'home';
                                break;
                            case 'Notifications':
                                iconName = 'notifications';
                                break;
                            case 'Manage':
                                iconName = 'business';
                                break;
                            case 'Profile':
                                iconName = 'person';
                                break;
                        }

                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#004B49',
                    tabBarInactiveTintColor: '#7F8C8D',
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopColor: 'transparent',
                        paddingBottom: 10,
                        height: 60,
                    },
                    headerShown: false, // This removes the header
                })}
            >
                <Tab.Screen name="Home">
                    {() => (
                        <ScrollView contentContainerStyle={styles.container}>
                            <TouchableOpacity
                                style={styles.languageButton}
                                onPress={() => setModalVisible(true)}
                            >
                                <Icon name="language" size={24} color="#004B49" />
                            </TouchableOpacity>

                            <Animated.View style={{ ...styles.titleContainer, opacity: fadeAnim }}>
                                <Text style={styles.title}>{translations.home || 'Home Screen'}</Text>
                            </Animated.View>
                            <Animated.View style={{ ...styles.buttonContainer, opacity: fadeAnim }}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.buttonText}>{translations.goToLogin || 'Go to Login'}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            <View style={styles.chatContainer}>
                                <View style={styles.messagesContainer}>
                                    {messages.map((msg, index) => (
                                        <View key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
                                            <Text style={styles.messageText}>{msg.text}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={userInput}
                                        onChangeText={setUserInput}
                                        placeholder="Type your message..."
                                    />
                                    <Button title="Send" onPress={handleSend} />
                                </View>
                            </View>

                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={() => setModalVisible(false)}
                            >
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>Select Language</Text>
                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={() => changeLanguage('en')}
                                        >
                                            <Text style={styles.modalButtonText}>English</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={() => changeLanguage('fr')}
                                        >
                                            <Text style={styles.modalButtonText}>French</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.modalButton}
                                            onPress={() => changeLanguage('es')}
                                        >
                                            <Text style={styles.modalButtonText}>Spanish</Text>
                                        </TouchableOpacity>
                                        <Button title="Close" onPress={() => setModalVisible(false)} />
                                    </View>
                                </View>
                            </Modal>
                        </ScrollView>
                    )}
                </Tab.Screen>
                <Tab.Screen name="Notifications" component={NotificationsScreen} />
                <Tab.Screen name="Manage" component={ManageScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

const NotificationsScreen = () => {
    const notifications = [
        { id: '1', title: 'New Feature Release', description: 'Check out our latest feature updates!' },
        { id: '2', title: 'Maintenance Notice', description: 'Scheduled maintenance will occur this weekend.' },
        { id: '3', title: 'Reminder', description: 'Don’t forget to update your profile.' },
    ];

    return (
        <View style={styles.notificationsContainer}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.notificationItem}>
                        <Text style={styles.notificationTitle}>{item.title}</Text>
                        <Text style={styles.notificationDescription}>{item.description}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const ManageScreen = () => (
    <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Manage Screen</Text>
    </View>
);

const ProfileScreen = () => {
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        profilePicture: 'https://example.com/profile.jpg',
    };

    return (
        <View style={styles.profileContainer}>
            <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    titleContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#004B49',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
        marginBottom: 10,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007BFF',
        borderRadius: 5,
        padding: 10,
        margin: 5,
        maxWidth: '80%',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#EAEAEA',
        borderRadius: 5,
        padding: 10,
        margin: 5,
        maxWidth: '80%',
    },
    messageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#004B49',
        marginBottom: 10,
    },
    modalButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    notificationsContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    notificationsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    notificationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationDescription: {
        fontSize: 14,
    },
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenText: {
        fontSize: 24,
    },
    profileContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileEmail: {
        fontSize: 16,
        color: '#555',
    },
    languageButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#004B49',
        borderRadius: 50,
        padding: 10,
    },
});

export default HomeScreen;
