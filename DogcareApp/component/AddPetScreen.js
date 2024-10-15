import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const AddPetScreen = ({ route, navigation, userToken }) => {
  const [petName, setPetName] = useState('');
  const [petPic, setPetPic] = useState(null); // เปลี่ยนเป็น null
  const [breedId, setBreedId] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petHeight, setPetHeight] = useState('');
  const [petBd, setPetBd] = useState(new Date());
  const [petSex, setPetSex] = useState('M');
  const [breeds, setBreeds] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 

  useEffect(() => {
    fetch('http://192.168.3.82/dogcare/breedinfo.php')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBreeds(data);
        } else {
          console.error('Unexpected response format:', data);
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลพันธุ์สุนัขได้');
        }
      })
      .catch(error => {
        console.error('Error fetching breeds:', error);
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลพันธุ์สุนัขได้');
      });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setPetName('');
      setPetPic(null);
      setBreedId('');
      setPetWeight('');
      setPetHeight('');
      setPetBd(new Date());
      setPetSex('M');
    }, [])
  );

  const handleAddPet = async () => {
    if (!petName || !breedId || !petWeight || !petHeight) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }
  
    // Prepare FormData to send
    const formData = new FormData();
    formData.append('petName', petName);
    formData.append('breedId', breedId);
    formData.append('petWeight', petWeight);
    formData.append('petHeight', petHeight);
    formData.append('petBd', petBd.toISOString().split('T')[0]);
    formData.append('petSex', petSex);
    formData.append('userId', userToken);
  
    // Append petPic if an image has been selected
    if (selectedImage) {
      formData.append('picture', {
        uri: selectedImage.uri,
        name: selectedImage.fileName,
        type: selectedImage.mimeType,
      });
    }
  
    try {
      const response = await fetch('http://192.168.3.82/dogcare/addpet.php', {
        method: 'POST',
        body: formData, // Send FormData directly
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        Alert.alert('สำเร็จ', 'สัตว์เลี้ยงของคุณได้ถูกเพิ่มเรียบร้อยแล้ว');
        navigation.navigate('Mypet');
      } else {
        Alert.alert('ข้อผิดพลาด', result.message || 'ไม่สามารถเพิ่มสัตว์เลี้ยงได้');
      }
    } catch (error) {
      console.error('Add Pet error:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดขณะเพิ่มสัตว์เลี้ยง');
    }
  };
  

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setPetPic(result.assets[0].uri); // Update petPic with the selected image URI
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เพิ่มสัตว์เลี้ยง</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อสัตว์เลี้ยง"
        value={petName}
        onChangeText={setPetName}
      />
      
      {/* Image Picker */}
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>เลือกภาพสัตว์เลี้ยง</Text>
        )}
      </TouchableOpacity>

      {/* Breed Selector */}
      <Picker
        selectedValue={breedId}
        style={styles.input}
        onValueChange={(itemValue) => setBreedId(itemValue)}
      >
        <Picker.Item label="เลือกพันธุ์" value="" />
        {breeds.map((breed) => (
          <Picker.Item key={breed.breed_id} label={breed.breed_name} value={breed.breed_id} />
        ))}
      </Picker>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 60 }]}
          placeholder="น้ำหนักสัตว์เลี้ยง"
          value={petWeight}
          onChangeText={setPetWeight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>กก.</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 60 }]}
          placeholder="ความสูงสัตว์เลี้ยง"
          value={petHeight}
          onChangeText={setPetHeight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>นิ้ว</Text>
      </View>

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.label}>วันเกิดของสัตว์เลี้ยง:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{petBd.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={petBd}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || petBd;
              setShowDatePicker(false);
              setPetBd(currentDate);
            }}
          />
        )}
      </View>

      {/* Pet Sex Radio Buttons */}
      <View style={styles.radioContainer}>
        <Text style={styles.label}>เพศสัตว์เลี้ยง:</Text>
        <TouchableOpacity style={styles.radioOption} onPress={() => setPetSex('M')}>
          <Text style={[styles.radioText, petSex === 'M' && styles.radioSelected]}>M</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioOption} onPress={() => setPetSex('F')}>
          <Text style={[styles.radioText, petSex === 'F' && styles.radioSelected]}>F</Text>
        </TouchableOpacity>
      </View>

      <Button title="เพิ่มสัตว์เลี้ยง" onPress={handleAddPet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  imagePicker: {
    backgroundColor: '#f0f0f0',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: 'gray',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    color: 'gray',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  unit: {
    position: 'absolute',
    right: 10,
    top: '35%',
    transform: [{ translateY: -10 }],
    fontSize: 16,
    color: '#333',
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  dateButtonText: {
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  radioSelected: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
});

export default AddPetScreen;
