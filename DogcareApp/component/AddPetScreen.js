import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import from the correct package
import { useFocusEffect } from '@react-navigation/native';

const AddPetScreen = ({ route, navigation, userToken }) => {
  const [petName, setPetName] = useState('');
  const [petPic, setPetPic] = useState('');
  const [breedId, setBreedId] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petHeight, setPetHeight] = useState('');
  const [userId, setUserId] = useState('');
  const [petBd, setPetBd] = useState({
    day: '01',
    month: '01',
    year: '2000',
  });
  const [petSex, setPetSex] = useState('M'); // Default to 'M'
  const [breeds, setBreeds] = useState([]);
  const [days, setDays] = useState(Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')));
  const [months, setMonths] = useState(Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')));
  const [years, setYears] = useState(Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString()));

  useEffect(() => {
    // Fetch breeds from the API
    fetch('http://192.168.3.158/dogcare/breedinfo.php')

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
      setPetBd({ day: '01', month: '01', year: '2000' });
      setPetSex('M');
    }, [])
  );

  const handleAddPet = async () => {
    // Validate required fields
    if (!petName || !petPic || !breedId || !petWeight || !petHeight || !petBd.day || !petBd.month || !petBd.year) {
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
      petBd: `${petBd.year}-${petBd.month}-${petBd.day}`, // Format date for database
      petSex,
      userId: userToken, // Use userToken as userId
    };

    try {
      const response = await fetch('http://192.168.3.150/dogcare/addpet.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      // Read and log the response text
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      // Try parsing JSON
      const result = JSON.parse(responseText);

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

      {/* Date Picker for Day, Month, and Year */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.label}>วันเกิดของสัตว์เลี้ยง:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={petBd.day}
            style={styles.picker}
            onValueChange={(itemValue) => setPetBd(prev => ({ ...prev, day: itemValue }))}
          >
            {days.map(day => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
          <Picker
            selectedValue={petBd.month}
            style={styles.picker}
            onValueChange={(itemValue) => setPetBd(prev => ({ ...prev, month: itemValue }))}
          >
            {months.map(month => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>
          <Picker
            selectedValue={petBd.year}
            style={styles.picker}
            onValueChange={(itemValue) => setPetBd(prev => ({ ...prev, year: itemValue }))}
          >
            {years.map(year => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>
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
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    height: 40,
    marginHorizontal: 4,
    borderColor: 'gray',
    borderWidth: 1,
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
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default AddPetScreen;
