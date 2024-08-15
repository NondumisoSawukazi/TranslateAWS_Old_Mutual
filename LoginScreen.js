import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Alert, Image } from 'react-native';
import AWS from 'aws-sdk';
import { useLanguage } from './LanguageContext'; // Import the language context

// Configure AWS
AWS.config.update({
  region: 'us-east-1',
  credentials: new AWS.Credentials('AKIAXYKJWQPXKSAPL65K', 'B0C1IMYKGadHannXCNrgeIBJwmtDAF/VUnWMg5nX'),
});

const dynamodb = new AWS.DynamoDB.DocumentClient(); // For DynamoDB operations

export default function LoginScreen({ navigation }) {
  const { language } = useLanguage(); // Use the language from the context
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [translatedText, setTranslatedText] = useState({});

  const handleLogin = async () => {
    console.log('User logging in with:', {
      idNumber,
      password,
    });

    try {
      // Fetch user data from DynamoDB
      const params = {
        TableName: 'dbUser', // Replace with your DynamoDB table name
        Key: {
          userID: idNumber, // Use the unique identifier
        },
      };

      const data = await dynamodb.get(params).promise();

      if (data.Item) {
        // User exists, check the password
        if (data.Item.password === password) {
          console.log('Login successful');
          navigation.navigate('Home'); // Navigate to HomeScreen
        } else {
          Alert.alert('Login Failed', 'Incorrect password');
        }
      } else {
        Alert.alert('Login Failed', 'User not found');
      }
    } catch (error) {
      console.error('Error fetching user data from DynamoDB:', error);
    }
  };

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(scaleAnim, {
      toValue: 1.05,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (language) {
        const translations = await Promise.all([
          translateText('ID Number', language),
          translateText('Password', language),
          translateText('Login', language),
          translateText('Enter your ID number', language),
          translateText('Enter your password', language),
          translateText('Forgot Password?', language),
          translateText('Sign Up', language),
        ]);
        setTranslatedText({
          idNumber: translations[0],
          password: translations[1],
          login: translations[2],
          idNumberPlaceholder: translations[3],
          passwordPlaceholder: translations[4],
          forgotPassword: translations[5],
          signUp: translations[6],
        });
      }
    };
    fetchTranslations();
  }, [language]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./old_mutual_image.png')} // Path to your Old Mutual logo
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
      />
      <Animated.View style={{ ...styles.form, opacity: fadeAnim }}>
        <Text style={styles.title}>{translatedText.login || 'Login'}</Text>

        <TextInput
          style={styles.input}
          placeholder={translatedText.idNumberPlaceholder || 'ID Number'}
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder={translatedText.passwordPlaceholder || 'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>{translatedText.login || 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>{translatedText.signUp || 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {/* Handle forgot password */}}
        >
          <Text style={styles.buttonText}>{translatedText.forgotPassword || 'Forgot Password?'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004d40', // Dark green background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 30,
  },
  form: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#ffffff', // White background for the form
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#004d40', // Dark green title
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0', // Light gray input background
    color: '#333', // Dark text color
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00796b', // Slightly lighter green button
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff', // White button text
    fontSize: 18,
    fontWeight: 'bold',
  },
});
