// LoginScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useLanguage } from './LanguageContext'; // Import the language context
import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: 'us-east-1',
  credentials: new AWS.Credentials('AKIAXYKJWQPXKSAPL65K', 'B0C1IMYKGadHannXCNrgeIBJwmtDAF/VUnWMg5nX'),
});

const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient(); // For DynamoDB operations

export default function LoginScreen({ navigation }) {
  const { language } = useLanguage(); // Use the language from the context
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translatedText, setTranslatedText] = useState({});

  const handleLogin = async () => {
    console.log('User logged in with:', {
      idNumber,
      password,
    });

    // Navigate to HomeScreen after successful login
    navigation.navigate('Home');
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
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#555',
    color: '#fff',
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
