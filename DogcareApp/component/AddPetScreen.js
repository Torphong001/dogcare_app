import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Dialog from 'react-native-dialog';

const AddPetScreen = ({ route, navigation, userToken }) => {
  const [petName, setPetName] = useState('');
  const [petPic, setPetPic] = useState(null);
  const [breedId, setBreedId] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petHeight, setPetHeight] = useState('');
  const [petBd, setPetBd] = useState(new Date());
  const [petSex, setPetSex] = useState('M');
  const [breeds, setBreeds] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    fetch('http://192.168.50.72/dogcare/breedinfo.php')
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
  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };
  const handleAddPet = async () => {
    if (!petName || !breedId || !petWeight || !petHeight) {
      showDialog('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    const formData = new FormData();
    formData.append('petName', petName);
    formData.append('breedId', breedId);
    formData.append('petWeight', petWeight);
    formData.append('petHeight', petHeight);
    formData.append('petBd', petBd.toISOString().split('T')[0]);
    formData.append('petSex', petSex);
    formData.append('userId', userToken);

    if (selectedImage) {
      formData.append('picture', {
        uri: selectedImage.uri,
        name: selectedImage.fileName,
        type: selectedImage.mimeType,
      });
    }

    try {
      const response = await fetch('http://192.168.50.72/dogcare/addpet.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showDialog('สัตว์เลี้ยงของคุณได้ถูกเพิ่มเรียบร้อยแล้ว');
        setTimeout(() => {
          navigation.navigate('Mypet');
        }, 3000);
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
      setPetPic(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Picker */}
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>เลือกภาพ</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.titlebox}>ชื่อสุนัข :</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        value={petName}
        onChangeText={setPetName}
      />
      {/* Breed Selector */}
      <Text style={styles.titlebox}>ชื่อสายพันธุ์ :</Text>
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
      <Text style={styles.titlebox}>น้ำหนัก :</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 60 }]}
          placeholder=""
          value={petWeight}
          onChangeText={setPetWeight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>กก.</Text>
      </View>
      <Text style={styles.titlebox}>ส่วนสูง :</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 60 }]}
          placeholder=""
          value={petHeight}
          onChangeText={setPetHeight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>นิ้ว</Text>
      </View>

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.titlebox}>วันเกิด:</Text>
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
        <Text style={styles.titlebox}>เพศ:</Text>
        <TouchableOpacity style={styles.radioOption} onPress={() => setPetSex('M')}>
          <Text style={[styles.radioText, petSex === 'M' && styles.radioSelected]}>เพศผู้</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioOption} onPress={() => setPetSex('F')}>
          <Text style={[styles.radioText, petSex === 'F' && styles.radioSelected]}>เพศเมีย</Text>
        </TouchableOpacity>
      </View>

      <Button title="เพิ่มสัตว์เลี้ยง" onPress={handleAddPet} color="#FF9090" />
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title></Dialog.Title>
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
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  imagePicker: {
    backgroundColor: '#f0f0f0',
    height: 120,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 100, // ทำให้ขอบเป็นวงกลม
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 100, // ทำให้รูปภาพเป็นวงกลม
  },
  imagePlaceholder: {
    color: 'gray',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  unit: {
    position: 'absolute',
    right: 16,
    top: 10,
    color: '#888',
  },
  datePickerContainer: {
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateButtonText: {
    textAlign: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  radioOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  radioText: {
    fontSize: 16,
    color: '#888',
  },
  radioSelected: {
    color: '#FF9090',
    fontWeight: 'bold',
  },
  titlebox: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default AddPetScreen;
