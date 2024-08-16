import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, FlatList, TextInput, Modal, Image } from 'react-native';
import AWS from 'aws-sdk';
import { useLanguage } from './LanguageContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.Credentials('AKIAXYKJWQPXKSAPL65K', 'B0C1IMYKGadHannXCNrgeIBJwmtDAF/VUnWMg5nX'),
});

const lexruntime = new AWS.LexRuntimeV2();
const botId = 'FXNXT7ABHO';
const botAliasId = '2JWA77FZT5';
const localeId = 'en_US';
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

const translateTextToEnglish = async (text, sourceLanguage) => {
    try {
        const translate = new AWS.Translate();
        const params = {
            SourceLanguageCode: sourceLanguage,
            TargetLanguageCode: 'en',
            Text: text,
        };

        const result = await translate.translateText(params).promise();
        return result.TranslatedText;
    } catch (error) {
        console.error('Error translating text to English:', error);
        return text;
    }
};

const detectLanguage = async (text) => {
    try {
        const comprehend = new AWS.Comprehend();
        const params = {
            TextList: [text],
        };
        const result = await comprehend.batchDetectDominantLanguage(params).promise();
        return result.ResultList[0].LanguageCode;
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en'; // Default to English if detection fails
    }
};

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
    const { language, setLanguage } = useLanguage();
    const [translations, setTranslations] = useState({});
    const [fadeAnim] = useState(new Animated.Value(0));
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
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
        const currentLanguage = language;
        const targetLanguage = currentLanguage === 'af' ? 'en' : 'af'; // Translate to English if the language is Afrikaans

        // Detect the language of the user input
        const detectedLanguage = await detectLanguage(userInput);
        const responseLanguage = detectedLanguage === 'en' ? 'en' : 'af';

        // Translate user input to English if it's not in English
        const translatedInput = detectedLanguage !== 'en'
            ? await translateTextToEnglish(userInput, detectedLanguage)
            : userInput;

        const newMessage = { text: userInput, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, newMessage]);

        const params = {
            botId: botId,
            botAliasId: botAliasId,
            localeId: localeId,
            text: translatedInput,
            sessionId: userId,
        };

        try {
            const data = await lexruntime.recognizeText(params).promise();
            console.log('Data received from Lex:', JSON.stringify(data));

            const botMessageText = data.requestAttributes && data.requestAttributes['x-amz-lex:qnA-search-response']
                ? data.requestAttributes['x-amz-lex:qnA-search-response']
                : 'No response from bot';

            // Translate Lex response to Afrikaans if necessary
            const translatedBotMessage = responseLanguage !== 'af'
                ? await translateText(botMessageText, 'af')
                : botMessageText;

            const botMessage = { text: translatedBotMessage, sender: 'bot' };

            setMessages(prevMessages => [...prevMessages, botMessage]);
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

    const renderItem = useCallback(({ item }) => (
        <View style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    ), [messages]);

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
                    tabBarActiveTintColor: '#004B49', // Old Mutual dark green
                    tabBarInactiveTintColor: '#7F8C8D',
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopColor: 'transparent',
                        paddingBottom: 10,
                        height: 60,
                    },
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Home">
                    {() => (
                        <View style={styles.container}>
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
                                <FlatList
                                    data={messages}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={renderItem}
                                    contentContainerStyle={styles.messagesContainer}
                                    inverted
                                />
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={userInput}
                                        onChangeText={setUserInput}
                                        placeholder="Type your message..."
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                        <Icon name="send" size={24} color="#fff" />
                                    </TouchableOpacity>
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
                                            onPress={() => changeLanguage('af')}
                                        >
                                            <Text style={styles.modalButtonText}>Afrikaans</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                            <Text style={styles.closeButtonText}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        </View>
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
    const [notifications, setNotifications] = useState([
        { id: '1', title: 'New Message', description: 'You have received a new message.' },
        { id: '2', title: 'Update Available', description: 'A new update is available for your app.' },
    ]);

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

const ProfileScreen = () => (
    <View style={styles.profileContainer}>
        <Image style={styles.profilePicture} source={{ uri: 'https://via.placeholder.com/120' }} />
        <Text style={styles.profileName}>John Doe</Text>
        <Text style={styles.profileEmail}>johndoe@example.com</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    titleContainer: {
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: 'linear-gradient(135deg, #004B49, #00796B)', // Add gradient effect
        borderRadius: 10,
        padding: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#004B49', // Old Mutual dark green
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#00796B', // Darker green shade for the button
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25, // More rounded corners
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    messagesContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end', // Ensure messages are aligned to the bottom
        padding: 10,
    },

    // Style for user messages
    userMessage: {
        alignSelf: 'flex-end', // Align user messages to the right
        backgroundColor: '#004B49', // Old Mutual dark green
        borderRadius: 20,
        padding: 15,
        marginBottom: 10,
        maxWidth: '75%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },

    // Style for bot messages
    botMessage: {
        alignSelf: 'flex-start', // Align bot messages to the left
        backgroundColor: '#EAEAEA',
        borderRadius: 20,
        padding: 15,
        marginBottom: 10,
        maxWidth: '75%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },

    // Style for message text
    messageText: {
        color: '#fff', // White text color for messages
        fontSize: 16,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        borderRadius: 20,
        marginHorizontal: 10,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        padding: 10,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#00796B', // Darker green shade
        padding: 12,
        borderRadius: 25,
        elevation: 4,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
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
        borderRadius: 15,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalButton: {
        padding: 12,
        borderRadius: 5,
        backgroundColor: '#00796B', // Darker green shade
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    // Modal button text style
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
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
        color: '#004B49', // Old Mutual dark green
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
        color: '#555',
    },
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenText: {
        fontSize: 24,
        color: '#004B49', // Old Mutual dark green
    },
    profileContainer: {
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
        borderWidth: 2,
        borderColor: '#004B49', // Old Mutual dark green
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#004B49', // Old Mutual dark green
    },
    profileEmail: {
        fontSize: 16,
        color: '#555',
    },
    languageButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
        elevation: 4,
    },
    closeButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#004B49', // Old Mutual dark green
        marginTop: 10,
    },
    // Close button text style
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    }
});

export default HomeScreen;
