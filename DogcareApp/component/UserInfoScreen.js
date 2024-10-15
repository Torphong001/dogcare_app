import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

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

        if (storedToken) {
          const response = await axios.get('http://192.168.3.82/dogcare/userinfo.php', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

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
          'http://192.168.3.82/dogcare/edituserinfo.php',
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
    <View style={styles.container}>
      <View style={styles.innerContainer}>
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
          <Image source={{ uri: `http://192.168.3.82/dogcare/uploads/${userInfo.picture}` }} style={styles.image} />
        ) : (
          <FontAwesome name="user" size={100} color="gray" />
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>ชื่อ</Text>
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.firstName}
            editable={isEditing}
            placeholder="ชื่อ"
            onChangeText={(text) => setUserInfo({ ...userInfo, firstName: text })}
          />
          <Text style={styles.label}>นามสกุล</Text>
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.lastName}
            editable={isEditing}
            placeholder="นามสกุล"
            onChangeText={(text) => setUserInfo({ ...userInfo, lastName: text })}
          />
          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.tel}
            editable={isEditing}
            placeholder="เบอร์โทรศัพท์"
            onChangeText={(text) => setUserInfo({ ...userInfo, tel: text })}
          />
          <Text style={styles.label}>ไอดีไลน์</Text>
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.line_id}
            editable={isEditing}
            placeholder="ไอดีไลน์"
            onChangeText={(text) => setUserInfo({ ...userInfo, line_id: text })}
          />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  innerContainer: {
    width: width * 0.9, // Container width as a percentage of screen width
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    borderColor: '#FF9090',
    borderWidth: 3,
    alignItems: 'center',
    elevation: 5,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF9090',
    borderRadius: 20,
    padding: 10,
  },
  logoutButton: {
    backgroundColor: '#FF9090',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
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
    borderColor: '#FF9090',
  },
  inputEditing: {
    backgroundColor: '#ffffff',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 5,
    borderColor: '#FF9090',
  },
});

export default UserInfoScreen;
