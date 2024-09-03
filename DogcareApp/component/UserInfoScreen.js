import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; // ใช้ FontAwesome สำหรับไอคอน user

const UserInfoScreen = ({ navigation, setUserToken }) => {
  const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Track token state
  const [isEditing, setIsEditing] = useState(false); // Track editing state

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    navigation.navigate('Login'); // Navigate to Login screen after logout
  };

  const handleEditSave = async () => {
    if (isEditing) {
      try {
        const response = await axios.post(
          'http://192.168.3.180/dogcare/edituserinfo.php',
          {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            tel: userInfo.tel,
            line_id: userInfo.line_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Update Response:', response.data); // Debug: Check the update response
        setIsEditing(false); // Switch back to non-editing mode after saving
      } catch (error) {
        console.error('Failed to update user info:', error);
      }
    } else {
      setIsEditing(true); // Enable editing
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditSave}
        >
          <FontAwesome
            name={isEditing ? "check" : "pencil"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        {userInfo.picture ? (
          <Image source={{ uri: userInfo.picture }} style={styles.image} />
        ) : (
          <FontAwesome name="user" size={100} color="gray" />
        )}
        <View style={styles.infoContainer}>
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.firstName}
            editable={isEditing}
            placeholder="ชื่อ"
            onChangeText={(text) => setUserInfo({ ...userInfo, firstName: text })}
          />
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.lastName}
            editable={isEditing}
            placeholder="นามสกุล"
            onChangeText={(text) => setUserInfo({ ...userInfo, lastName: text })}
          />
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.tel}
            editable={isEditing}
            placeholder="เบอร์โทรศัพท์"
            onChangeText={(text) => setUserInfo({ ...userInfo, tel: text })}
          />
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.line_id}
            editable={isEditing}
            placeholder="ไอดีไลน์"
            onChangeText={(text) => setUserInfo({ ...userInfo, line_id: text })}
          />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  container: {
    width: '100%',
    backgroundColor: '#ffffff', // White background color for the box
    borderRadius: 10,
    padding: 20,
    borderColor: '#ff7f7f', // Border color set to #ff7f7f
    borderWidth: 5, // Adjust border width as needed
    alignItems: 'center',
    position: 'relative', // Position relative to place the edit button
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff7f7f', // Button background color
    borderRadius: 20, // Circular shape
    padding: 10,
  },
  logoutButton: {
    backgroundColor: '#ff7f7f', // Background color for the logout button
    padding: 10,
    borderRadius: 20, // Rounded corners
    marginTop: 20, // Space between input fields and logout button
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
    borderWidth: 2,
    borderColor: '#ff7f7f', // Border color for text boxes
  },
  inputEditing: {
    backgroundColor: '#ffffff', // White background when editing
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 5,
    borderColor: '#000000',
  },
});

export default UserInfoScreen;
