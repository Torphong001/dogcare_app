import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const StepRegisterScreen1 = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert(' ', 'โปรดกรอกข้อมูลให้ครบ');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(' ', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    navigation.navigate('StepRegister2', { username, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>กรอกชื่อผู้ใช้และรหัสผ่าน</Text>
      <Text style={styles.titlebox}>ชื่อผู้ใช้งาน :</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.titlebox}>รหัสผ่าน :</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.titlebox}>ยืนยันรหัสผ่าน :</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>ถัดไป</Text>
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
    fontSize: 28,
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
  titlebox: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default StepRegisterScreen1;
