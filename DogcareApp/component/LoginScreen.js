import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation, handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = async () => {
    try {
      const response = await fetch('http://192.168.3.180/dogcare/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        await AsyncStorage.setItem('userToken', result.token);
        handleLogin(result.token); // Call handleLogin to update userToken
        Alert.alert('Login Successful', `Your token is: ${result.token}`);
        console.log('Token:', result.token);
        navigation.navigate('Breed');
      } else {
        Alert.alert('Error', result.message || 'Username or Password is incorrect');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', `เกิดข้อมูลพลาดจากฐานข้อมูล`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLoginPress} />

      <Button
        title="Register"
        onPress={() => navigation.navigate('StepRegister1')}
        style={styles.registerButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  tokenText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 10,
  },
});

export default LoginScreen;
