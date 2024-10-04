import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Alert, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Asset } from 'expo-asset';

const SearchScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [showBreedButton, setShowBreedButton] = useState(false);
  const [breedResults, setBreedResults] = useState([]);
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await tf.ready(); // รอให้ TensorFlow พร้อมใช้งานก่อน
        
        // ตรวจสอบว่า TensorFlow พร้อมใช้งานจริงหรือไม่
        if (tf.isLoaded()) {
          setIsTfReady(true);
          Alert.alert('TensorFlow พร้อมใช้งาน');
        } else {
          Alert.alert('TensorFlow ยังไม่พร้อมใช้งาน');
        }
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        Alert.alert('ไม่สามารถเตรียม TensorFlow ได้');
      }
    };

    initializeTensorFlow();
  }, []);

  const loadModel = async () => {
    try {
      const model = await tf.loadGraphModel('https://storage.googleapis.com/tm-model/a5yCGpx8k/model.json');
      setModel(model);
      Alert.alert('โมเดลโหลดเรียบร้อย');
    } catch (error) {
      console.error('Error loading model:', error);
      Alert.alert('ไม่สามารถโหลดโมเดลได้');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('ต้องอนุญาตการเข้าถึงคลังภาพก่อนถึงจะเลือกภาพได้');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets) {
      setImageUri(result.assets[0].uri);
      setShowBreedButton(true);
    }
  };

  const processImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageTensor = await tf.browser.fromBlob(blob);
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]); // ปรับขนาดให้ตรงกับโมเดล
    const normalizedTensor = resizedTensor.div(255.0); // Normalize
    return normalizedTensor.expandDims(0); // เพิ่มมิติ
  };

  const handleBreedDetection = async () => {
    if (!isTfReady) {
      Alert.alert('TensorFlow ไม่พร้อมใช้งาน');
      return;
    }
    if (!model) {
      await loadModel(); // โหลดโมเดลถ้ายังไม่ได้โหลด
    }
    Alert.alert("กำลังระบุสายพันธุ์จากภาพที่เลือก...");

    const imageTensor = await processImage(imageUri);

    const predictions = await model.predict(imageTensor).data();

    const results = predictions.map((prediction, index) => ({
      name: `Breed ${index + 1}`, // หรือใช้ชื่อจาก metadata
      percentage: (prediction * 100).toFixed(2),
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 3); // เรียงลำดับและเลือก 3 ตัวเลือก

    setBreedResults(results);
    Alert.alert('ผลลัพธ์', JSON.stringify(results));
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
      {breedResults.length > 0 && (
        <View>
          <Text>ผลการระบุสายพันธุ์:</Text>
          {breedResults.map((breed, index) => (
            <Text key={index}>{`${breed.name}: ${breed.percentage}%`}</Text>
          ))}
        </View>
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
