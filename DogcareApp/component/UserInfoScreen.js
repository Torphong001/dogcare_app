import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; // ใช้ FontAwesome สำหรับไอคอน user

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
              tel: response.data.tel,
              line_id: response.data.line_id,
              picture: response.data.picture,
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
      {userInfo.picture ? (
        <Image source={{ uri: userInfo.picture }} style={styles.image} />
      ) : (
        <FontAwesome name="user" size={100} color="gray" />
      )}
      <Text style={styles.text}>First Name: {userInfo.firstName}</Text>
      <Text style={styles.text}>Last Name: {userInfo.lastName}</Text>
      <Text style={styles.text}>Tel: {userInfo.tel}</Text>
      <Text style={styles.text}>Line ID: {userInfo.line_id}</Text>
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default UserInfoScreen;
