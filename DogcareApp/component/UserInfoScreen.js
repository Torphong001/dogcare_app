import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, Platform, Alert, } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Dialog from 'react-native-dialog';

const { width, height } = Dimensions.get('window');

const UserInfoScreen = ({ navigation, setUserToken }) => {
  const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '' });
  const [originalUserInfo, setOriginalUserInfo] = useState({}); // Store original user info
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        setToken(storedToken);

        if (storedToken) {
          const response = await axios.get('http://192.168.3.117/dogcare/userinfo.php', {
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
              password: response.data.password,
              picture: response.data.picture,
            });
            setOriginalUserInfo({
              firstName: response.data.firstname,
              lastName: response.data.lastname,
              tel: response.data.tel,
              line_id: response.data.line_id,
              password: response.data.password,
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
    navigation.navigate('Login'); 
  };

  const handleEditSave = async () => {
    if (isEditing) {
      try {
        const formData = new FormData();
        formData.append('firstName', userInfo.firstName);
        formData.append('lastName', userInfo.lastName);
        formData.append('tel', userInfo.tel);
        formData.append('line_id', userInfo.line_id);
        formData.append('password', userInfo.password);
        if (selectedImage) {
          formData.append('picture', {
            uri: selectedImage.uri,
            name: selectedImage.fileName,
            type: selectedImage.mimeType,
          });
        }
        console.log(selectedImage);
        const response = await axios.post(
          'http://192.168.3.117/dogcare/edituserinfo.php',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
  
        console.log(response.data);
        if (response.data.success) {
          showDialog('แก้ไขข้อมูลสําเร็จ');
          setIsEditing(false);
        } else {
          console.error('Error from API:', response.data.error);
          showDialog('แก้ไขข้อมูลไม่สําเร็จ');
        }
      } catch (error) {
        console.error('Failed to update user info:', error.response ? error.response.data : error.message);
      }
    } else {
      setIsEditing(true);
    }
  };
  
  
  
  const handleCancelEdit = () => {
    setUserInfo(originalUserInfo); // Reset the changes
    setSelectedImage(null); // Clear the selected image
    setIsEditing(false); // Exit edit mode
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const pickImage  = () => {
    Alert.alert(
      "เลือกตัวเลือก",
      "คุณต้องการใช้ภาพจากกล้องหรือคลัง?",
      [
        {
          text: "ถ่ายรูป",
          onPress: takePhotoWithCamera,
        },
        {
          text: "เลือกรูปจากคลัง",
          onPress: pickImageFromGallery,
        },
        {
          text: "ยกเลิก",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.editButtonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditSave}>
            <FontAwesome name={isEditing ? 'check' : 'pencil'} size={20} color="#fff" />
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <FontAwesome name="times" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity onPress={isEditing ? pickImage : null}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={[styles.image, isEditing && styles.imageEditing]}
            />
          ) : (
            userInfo.picture ? (
              <Image
                source={{ uri: `http://192.168.3.117/dogcare/uploads/${userInfo.picture}` }}
                style={[styles.image, isEditing && styles.imageEditing]}
              />
            ) : (
              <FontAwesome name="user" size={100} color="gray" />
            )
          )}
          {isEditing && (
            <View style={styles.iconOverlay}>
              <FontAwesome name="pencil" size={30} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

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
          <Text style={styles.label}>รหัสผ่าน</Text>
          <TextInput
            style={[styles.input, isEditing && styles.inputEditing]}
            value={userInfo.password}
            editable={isEditing}
            placeholder="รหัสผ่าน"
            onChangeText={(text) => setUserInfo({ ...userInfo, password: text })}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Description>
          {dialogMessage}
        </Dialog.Description>
        <Dialog.Button label="ตกลง" onPress={() => setDialogVisible(false)} />
      </Dialog.Container>
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
    width: width * 0.9,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    borderColor: '#FF9090',
    borderWidth: 3,
    alignItems: 'center',
    elevation: 5,
  },
  editButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#FF9090',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#FF9090',
    borderRadius: 20,
    padding: 10,
  },
  logoutButton: {
    backgroundColor: '#FF9090',
    padding: 10,
    borderRadius: 20,
    marginTop: 5,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  inputEditing: {
    backgroundColor: '#fff',
    borderColor: '#ff7f7f',
    borderWidth: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FF9090',
  },
  imageEditing: {
    
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
  },
});

export default UserInfoScreen;
