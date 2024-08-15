import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from './LanguageContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const { language, setLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTranslations = async () => {
      const textsToTranslate = {
        home: 'Home Screen',
        goToLogin: 'Go to Login',
      };

      const translatedTexts = await Promise.all(
        Object.entries(textsToTranslate).map(async ([key, text]) => {
          // Fetch translations (simulated here)
          const translatedText = await text; // Replace with actual translation function
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

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setModalVisible(false);
  };

  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
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
        })}
      >
        <Tab.Screen name="Home">
          {() => (
            <ScrollView contentContainerStyle={styles.container}>
              <Animated.View style={{ ...styles.titleContainer, opacity: fadeAnim }}>
                <Text style={styles.title}>{translations.home || 'Home Screen'}</Text>
              </Animated.View>

              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => setModalVisible(true)}
              >
                <Icon name="language" size={24} color="#004B49" />
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.buttonText}>{translations.goToLogin || 'Go to Login'}</Text>
                </TouchableOpacity>
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
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
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

const NotificationsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Notifications</Text>
  </View>
);

const ManageScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Manage Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Profile Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004B49',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#004B49',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#004B49',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 18,
    color: '#004B49',
  },
});

export default HomeScreen;
