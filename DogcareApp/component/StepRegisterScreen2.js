import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const StepRegisterScreen2 = ({ route, navigation }) => {
  const { username, password } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lineId, setLineId] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !phoneNumber || !lineId) {
      Alert.alert(' ', 'โปรดกรอกข้อมูลให้ครบ');
      return;
    }

    try {
      const response = await fetch('http://192.168.3.15/dogcare/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, firstName, lastName, phoneNumber, lineId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        Alert.alert(' ', 'สมัครสมาชิกสําเร็จ');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', `An error occurred during registration`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>กรอกข้อมูลส่วนตัว</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อ"
        placeholderTextColor="#aaa"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="นามสกุุล"
        placeholderTextColor="#aaa"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="เบอร์โทรศัพท์"
        placeholderTextColor="#aaa"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="ไอดีไลน์"
        placeholderTextColor="#aaa"
        value={lineId}
        onChangeText={setLineId}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>สมัครสมาชิก</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#FF9090',
  },
  input: {
    height: 50,
    borderColor: '#FF9090',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF9090',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StepRegisterScreen2;
