// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import AWS from 'aws-sdk';
import { useLanguage } from './LanguageContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Configure AWS
AWS.config.update({
  region: 'us-east-1', // replace with your AWS region
  credentials: new AWS.Credentials('AKIAXYKJWQPXKSAPL65K', 'B0C1IMYKGadHannXCNrgeIBJwmtDAF/VUnWMg5nX'),
});

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
  const { language } = useLanguage(); // Get current language from context
  const [translations, setTranslations] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

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
                iconName = 'business'; // Using 'business' as a close icon to 'briefcase'
                break;
              case 'Profile':
                iconName = 'person';
                break;
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#003B7D', // Old Mutual dark blue
            borderTopColor: 'transparent',
            paddingBottom: 10,
            height: 60,
          },
        })}
      >
        <Tab.Screen name="Home">
          {() => (
            <View style={styles.container}>
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

const NotificationsScreen = () => (
  <View style={styles.screenContainer}>
    <Text>Notifications Screen</Text>
  </View>
);

const ManageScreen = () => (
  <View style={styles.screenContainer}>
    <Text>Manage Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.screenContainer}>
    <Text>Profile Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003B7D', // Old Mutual dark blue
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#F5A623', // Old Mutual orange
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF', // White text
    fontSize: 18,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
