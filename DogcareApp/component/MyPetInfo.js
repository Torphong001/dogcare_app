import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';

const MyPetInfo = ({ route, navigation }) => {
  const { pet } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [breedInfo, setBreedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedPet, setUpdatedPet] = useState({
    pet_name: pet.pet_name,
    breed_name: pet.breed_name,
    pet_weight: pet.pet_weight.toString(), // Ensure values are strings
    pet_height: pet.pet_height.toString(), // Ensure values are strings
    pet_sex: pet.pet_sex,
    pet_bd: pet.pet_bd,
  });

  useEffect(() => {
    setUpdatedPet({
      pet_name: pet.pet_name,
      breed_name: pet.breed_name,
      pet_weight: pet.pet_weight.toString(),
      pet_height: pet.pet_height.toString(),
      pet_sex: pet.pet_sex,
      pet_bd: pet.pet_bd,
    });
  }, [pet]);

  const calculateAge = (birthDate) => {
    const birthMoment = moment(birthDate, 'YYYY-MM-DD');
    const currentMoment = moment();
    const years = currentMoment.diff(birthMoment, 'years');
    birthMoment.add(years, 'years');
    const months = currentMoment.diff(birthMoment, 'months');
    return `${years} ปี ${months} เดือน`;
  };

  const renderWithLineBreaks2 = (text) => {
    if (!text) return null;
    return text.split('|').map((line, index) => (
      <Text key={index} style={styles.modalText}>
        {line}
        {index < text.split('|').length - 1 && <Text>{'\n'}</Text>}
      </Text>
    ));
  };

  const fetchBreedInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.3.158/dogcare/getbreedinfo.php', { breed_id: pet.breed_id });
      setBreedInfo(response.data);
    } catch (error) {
      console.error('Error fetching breed info:', error);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setUpdatedPet({
      pet_name: pet.pet_name,
      breed_name: pet.breed_name,
      pet_weight: pet.pet_weight.toString(),
      pet_height: pet.pet_height.toString(),
      pet_sex: pet.pet_sex,
      pet_bd: pet.pet_bd,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    console.log(updatedPet);
    try {
      const response = await axios.post('http://192.168.3.158/dogcare/editpetinfo.php', {
        pet_id: pet.pet_id,
        ...updatedPet,
      });

      if (response.data.success) {
        Alert.alert("Success", "Pet information updated successfully!");
        setIsEditing(false);
        // Fetch updated pet data to refresh screen
        const updatedPetResponse = await axios.post('http://192.168.3.158/dogcare/getpetinfo.php', { pet_id: pet.pet_id });
        setUpdatedPet(updatedPetResponse.data);
      } else {
        Alert.alert("Error", "Failed to update pet information.");
      }
    } catch (error) {
      console.error("Error updating pet info:", error);
      Alert.alert("Error", "An error occurred while updating pet information.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: pet.pet_pic }} style={styles.petImage} />

      <View style={styles.infoContainer}>
        <Text style={styles.labelCentered}>ชื่อ:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={updatedPet.pet_name}
            onChangeText={(text) => setUpdatedPet({ ...updatedPet, pet_name: text })}
          />
        ) : (
          <Text style={styles.valueCentered}>{pet.pet_name}</Text>
        )}

        <Text style={styles.label}>สายพันธุ์:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={updatedPet.breed_name}
            onChangeText={(text) => setUpdatedPet({ ...updatedPet, breed_name: text })}
          />
        ) : (
          <Text style={styles.value}>{pet.breed_name}</Text>
        )}

        <View style={styles.inlineContainer}>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>เพศ:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={updatedPet.pet_sex}
                onChangeText={(text) => setUpdatedPet({ ...updatedPet, pet_sex: text })}
              />
            ) : (
              <Text style={styles.value}>
                {pet.pet_sex === 'M' ? 'ชาย' : pet.pet_sex === 'F' ? 'หญิง' : 'ไม่ระบุ'}
              </Text>
            )}
          </View>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>อายุ:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={updatedPet.pet_bd}
                onChangeText={(text) => setUpdatedPet({ ...updatedPet, pet_bd: text })}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.value}>{calculateAge(pet.pet_bd)}</Text>
            )}
          </View>
        </View>

        <View style={styles.inlineContainer}>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>น้ำหนัก:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={updatedPet.pet_weight}
                onChangeText={(text) => setUpdatedPet({ ...updatedPet, pet_weight: text })}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{pet.pet_weight} กก.</Text>
            )}
          </View>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>ส่วนสูง:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={updatedPet.pet_height}
                onChangeText={(text) => setUpdatedPet({ ...updatedPet, pet_height: text })}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{pet.pet_height} นิ้ว</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.moreButton, { backgroundColor: isEditing ? '#4CAF50' : '#FF9090' }]}
            onPress={isEditing ? handleSave : handleEditToggle}
          >
            <Text style={styles.moreButtonText}>{isEditing ? 'บันทึก' : 'แก้ไข'}</Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={[styles.moreButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.moreButtonText}>ยกเลิก</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={fetchBreedInfo}>
          <Text style={styles.moreButtonText}>ดูเพิ่มเติม</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : breedInfo ? (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: breedInfo.picture }} style={styles.modalImage} />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>{breedInfo.breed_name}</Text>
                    <Text style={styles.modalRegion}>{breedInfo.region}</Text>
                  </View>
                </View>
                <Text style={styles.modalDescription}>{renderWithLineBreaks2(breedInfo.description)}</Text>
              </ScrollView>
            ) : (
              <Text>ข้อมูลไม่พบ</Text>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  labelCentered: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  valueCentered: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#FF9090',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  inlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inlineItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moreButton: {
    backgroundColor: '#FF9090',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF7F7F',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  modalTextContainer: {
    flex: 1,
  },
  modalBreedName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalRegion: {
    fontSize: 16,
    color: '#666',
  },
  modalDescription: {
    fontSize: 16,
  },
});

export default MyPetInfo;
