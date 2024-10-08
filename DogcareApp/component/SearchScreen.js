import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Alert, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import Tflite from 'tflite-react-native'; // นำเข้าไลบรารี TFLite

const SearchScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [showBreedButton, setShowBreedButton] = useState(false);
  const [topBreed, setTopBreed] = useState(null);
  const [tflite, setTflite] = useState(null);

  const classNames = [
    "เกรย์ฮาวด์", "โกลเด้น รีทรีฟเวอร์", "คอลลี่", "ชเนาเซอร์", "ชิวาวา", "ชิสุห์", 
    "เชา เชา", "ซามอยด์", "ไซบีเรียน ฮัสกี้", "โดเบอร์แมน", "บอร์เดอร์ คอลลี่", 
    "บีเกิ้ล", "เบลเยี่ยมมาลินอยส์", "เบอร์นีสเมาน์เทนด็อก", "ปอมเมอเรเนียน", "ปั๊ก", 
    "ปักกิ่ง", "พอยเตอร์", "พุดเดิ้ล", "ร็อตไวเลอร์", "ลาบราดอร์รีทรีฟเวอร์", "วิปเพ็ท", 
    "อลาสกัน มาลามิวท์", "ไอริช วูล์ฟฮาวด์"
  ];

  const initializeTflite = async () => {
    const tfliteInstance = new Tflite();
    setTflite(tfliteInstance); // ตั้งค่า tflite instance

    // ดาวน์โหลดโมเดลและเลเบล

  
    await modelAsset.downloadAsync();
    await labelsAsset.downloadAsync();
    
    tfliteInstance.loadModel({
      model: modelAsset.localUri || modelAsset.uri,
      labels: labelsAsset.localUri || labelsAsset.uri,
    }, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Model Loaded', res);
      }
    });
  };
  
  useEffect(() => {
    initializeTflite();
  }, []);

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
    try {
      const imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return imgB64;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการประมวลผลภาพ:', error);
      Alert.alert('เกิดข้อผิดพลาดในการประมวลผลภาพ: ' + error.message);
      return null;
    }
  };

  const handleBreedDetection = async () => {
    if (!tflite) {
      Alert.alert('โมเดลยังไม่ได้โหลด');
      return;
    }

    Alert.alert("กำลังระบุสายพันธุ์จากภาพที่เลือก...");

    const imgB64 = await processImage(imageUri);
    if (!imgB64) return;

    tflite.runModelOnImage({
      path: imageUri,       // ใช้ path ของภาพ
      imageMean: 0,
      imageStd: 255,
      numResults: 3,        // จำนวนผลลัพธ์ที่ต้องการ
      threshold: 0.05       // กำหนด threshold สำหรับการคาดการณ์
    }, (err, res) => {
      if (err) {
        console.error('Error during prediction:', err);
        Alert.alert('เกิดข้อผิดพลาดระหว่างการคาดการณ์: ' + err.message);
      } else {
        const results = res.map((prediction) => ({
          name: classNames[prediction.index],
          percentage: (prediction.confidence * 100).toFixed(2),
        }));
        setTopBreed(results[0]); // ตั้งค่า topBreed เป็นผลลัพธ์ตัวแรก
        Alert.alert('ผลลัพธ์', JSON.stringify(results));
      }
    });
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
      {topBreed && (
        <View>
          <Text>{`ผลการระบุ: ${topBreed.name}, ${topBreed.percentage}%`}</Text>
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
