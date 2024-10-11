import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the new package
import { useFocusEffect } from '@react-navigation/native';

const AddPetScreen = ({ route, navigation, userToken }) => {
  const [petName, setPetName] = useState('');
  const [petPic, setPetPic] = useState('');
  const [breedId, setBreedId] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petHeight, setPetHeight] = useState('');
  const [userId, setUserId] = useState('');
  const [petBd, setPetBd] = useState(new Date()); // Set current date as default
  const [petSex, setPetSex] = useState('M'); // Default to 'M'
  const [breeds, setBreeds] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false); // Control the visibility of DatePicker

  useEffect(() => {
    // Fetch breeds from the API
    fetch('http://10.10.50.141/dogcare/breedinfo.php')
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
      // Reset all fields when screen is focused
      setPetName('');
      setPetPic('');
      setBreedId('');
      setPetWeight('');
      setPetHeight('');
      setPetBd(new Date()); // Reset to current date
      setPetSex('M');
    }, [])
  );

  const handleAddPet = async () => {
    // Validate required fields
    if (!petName || !petPic || !breedId || !petWeight || !petHeight) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    // Prepare the data to send
    const petData = {
      petName,
      petPic,
      breedId,
      petWeight,
      petHeight,
      petBd: petBd.toISOString().split('T')[0], // Format date for database
      petSex,
      userId: userToken, // Use userToken as userId
    };

    try {
      const response = await fetch('http://10.10.50.141/dogcare/addpet.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เพิ่มสัตว์เลี้ยง</Text>
      <TextInput
        style={styles.input}
        placeholder="ชื่อสัตว์เลี้ยง"
        value={petName}
        onChangeText={setPetName}
      />
      <TextInput
        style={styles.input}
        placeholder="ลิงก์ภาพสัตว์เลี้ยง"
        value={petPic}
        onChangeText={setPetPic}
      />
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
          style={[styles.input, { paddingRight: 60 }]} // Make room for unit text
          placeholder="น้ำหนักสัตว์เลี้ยง"
          value={petWeight}
          onChangeText={setPetWeight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>กก.</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 60 }]} // Make room for unit text
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
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    marginRight: 10,
    fontSize: 16,
  },
  radioOption: {
    marginHorizontal: 10,
  },
  radioText: {
    fontSize: 16,
    color: 'gray',
  },
  radioSelected: {
    fontWeight: 'bold',
    color: 'black',
  },
});

export default AddPetScreen;
