import React, { useState } from "react";
import { View, Button, Image, StyleSheet, Alert, Text, Modal, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Buffer } from "buffer";
import { MaterialIcons } from '@expo/vector-icons';

const SearchScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [showBreedButton, setShowBreedButton] = useState(false);
  const [topBreeds, setTopBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // ฟังก์ชันสำหรับเลือกภาพ
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("ต้องอนุญาตการเข้าถึงคลังภาพก่อนถึงจะเลือกภาพได้");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      setShowBreedButton(true);
      setTopBreeds([]); // รีเซ็ตผลการระบุเมื่อเลือกภาพใหม่
    }
  };

  // ฟังก์ชันสำหรับตรวจจับสายพันธุ์
  const handleBreedDetection = async () => {
    if (!imageUri) {
      Alert.alert("กรุณาเลือกภาพก่อน");
      return;
    }

    try {
      const imgData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        "https://dogpredic.cognitiveservices.azure.com/customvision/v3.0/Prediction/49504ade-0b92-49ef-abe8-ee1b7d3c2066/classify/iterations/Iteration1/image",
        Buffer.from(imgData, "base64"),
        {
          headers: {
            "Prediction-Key": "d6a8928da71147899d1d40a58d428238",
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const predictions = response.data.predictions;
      const results = predictions.map((prediction) => ({
        name: prediction.tagName,
        percentage: (prediction.probability * 100).toFixed(2),
      }));

      setTopBreeds(results.sort((a, b) => b.percentage - a.percentage).slice(0, 3));
    } catch (error) {
      console.error("Error during prediction:", error);
    }
  };

  // ฟังก์ชันสำหรับแสดงรายละเอียดพันธุ์
  const handleBreedDetails = async (breedname) => {
    try {
      const response = await axios.post(
        "http://192.168.3.82/dogcare/getbreedpredic.php",
        { breed_name: breedname }
      );
      const breedData = response.data;

      setSelectedBreed(breedData);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching breed details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="เลือกรูปภาพ" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {showBreedButton && (
        <Button title="ระบุสายพันธุ์" onPress={handleBreedDetection} />
      )}
      {topBreeds.length > 0 && (
        <View>
          <Text>ผลการระบุ:</Text>
          {topBreeds.map((breed, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>{`${index + 1}. ${breed.name}, ${breed.percentage}%`}</Text>
              <TouchableOpacity
                onPress={() => handleBreedDetails(breed.name)}
                style={{ marginLeft: 8 }}
              >
                <MaterialIcons name="search" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>ข้อมูลพันธุ์สุนัข</Text>
            <Text>ชื่อพันธุ์: {selectedBreed.breed_name}</Text>
            <Text>ID พันธุ์: {selectedBreed.breed_id}</Text>
            <Button title="ปิด" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default SearchScreen;
