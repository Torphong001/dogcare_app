import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const SearchScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [showBreedButton, setShowBreedButton] = useState(false);

  const pickImage = async () => {
    // ขอสิทธิ์การเข้าถึงคลังภาพ
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('ต้องอนุญาตการเข้าถึงคลังภาพก่อนถึงจะเลือกภาพได้');
      return;
    }

    // เปิดคลังภาพ
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets) {
      setImageUri(result.assets[0].uri);
      setShowBreedButton(true); // แสดงปุ่มหลังจากเลือกรูปภาพ
    } else if (!result.cancelled && result.uri) {
      setImageUri(result.uri);
      setShowBreedButton(true); // แสดงปุ่มหลังจากเลือกรูปภาพ
    } else {
      setShowBreedButton(false); // ไม่แสดงปุ่มถ้าไม่มีการเลือกรูป
    }
  };

  const handleBreedDetection = () => {
    // ฟังก์ชันสำหรับระบุสายพันธุ์สุนัข
    Alert.alert("กำลังระบุสายพันธุ์จากภาพที่เลือก...");
    // ที่นี่คุณสามารถเพิ่มฟังก์ชันที่จะใช้ในการส่งภาพไปยัง API เพื่อตรวจสอบสายพันธุ์
  };

  return (
    <View style={styles.container}>
      <Button title="เลือกรูปภาพ" onPress={pickImage} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      {showBreedButton && (
        <Button title="ระบุสายพันธุ์" onPress={handleBreedDetection} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});

export default SearchScreen;
