import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserInfoScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Track token state

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        setToken(storedToken); // Set token state
        console.log('Token:', storedToken); // Debug: Check if token is retrieved

        if (storedToken) {
          const response = await axios.get('http://192.168.3.180/dogcare/userinfo.php', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          console.log('Response:', response.data); // Debug: Check the response
          if (response.data.error) {
            console.error(response.data.error);
          } else {
            setUserInfo({
              firstName: response.data.firstname,
              lastName: response.data.lastname,
            });
          }
        } else {
          console.error('Token not found');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {token ? <Text style={styles.tokenText}>Token: {token}</Text> : null}
      <Text style={styles.text}>First Name: {userInfo.firstName}</Text>
      <Text style={styles.text}>Last Name: {userInfo.lastName}</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  tokenText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'gray',
  },
});

export default UserInfoScreen;
