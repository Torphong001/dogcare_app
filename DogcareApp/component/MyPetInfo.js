import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

const MyPetInfo = ({ route, navigation }) => {
  const { pet } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [breedInfo, setBreedInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateAge = (birthDate) => {
    const birthMoment = moment(birthDate, 'YYYY-MM-DD');
    const currentMoment = moment();
    const years = currentMoment.diff(birthMoment, 'years');
    birthMoment.add(years, 'years');
    const months = currentMoment.diff(birthMoment, 'months');
    return `${years} ปี ${months} เดือน`;
  };

  const renderWithLineBreaks2 = (text) => {
    if (!text) {
      return null;
    }
    return text.split('|').map((line, index) => (
      <Text key={index} style={styles.modalText}>
        {line}
        {index < text.split('|').length - 1 && <Text>{'\n'}</Text>}
      </Text>
    ));
  };

  const fetchBreedInfo = async () => {
    setLoading(true);
    console.log('fetching breed info for:', pet.breed_id);
    try {
      const response = await axios.post('http://192.168.3.180/dogcare/getbreedinfo.php', {
        breed_id: pet.breed_id,
      });
      setBreedInfo(response.data);
      console.log('Breed info:', response.data);
    } catch (error) {
      console.error('Error fetching breed info:', error);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  // Use useFocusEffect to fetch data when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPets();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: pet.pet_pic }} style={styles.petImage} />

      <View style={styles.infoContainer}>
        <Text style={styles.label}>ชื่อ:</Text>
        <Text style={styles.value}>{pet.pet_name}</Text>

        <Text style={styles.label}>สายพันธุ์:</Text>
        <Text style={styles.value}>{pet.breed_name}</Text>

        <Text style={styles.label}>น้ำหนัก:</Text>
        <Text style={styles.value}>{pet.pet_weight} กก.</Text>

        <Text style={styles.label}>ส่วนสูง:</Text>
        <Text style={styles.value}>{pet.pet_height} นิ้ว</Text>

        <Text style={styles.label}>เพศ:</Text>
        <Text style={styles.value}>
          {pet.pet_sex === 'M' ? 'ชาย' : pet.pet_sex === 'F' ? 'หญิง' : 'ไม่ระบุ'}
        </Text>

        <Text style={styles.label}>อายุ:</Text>
        <Text style={styles.value}>{calculateAge(pet.pet_bd)}</Text>

        <TouchableOpacity style={styles.moreButton} onPress={() => setModalVisible(true)}>
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
                <Text style={styles.modalText}>น้ำหนัก: {breedInfo.weight} กก.   ส่วนสูง: {breedInfo.height} นิ้ว</Text>
                <Text style={styles.modalText}>อายุขัย: {breedInfo.lifespan} ปี</Text>
                <Text style={styles.modalBreedName}>ลักษณะของสุนัขพันธุ์{breedInfo.breed_name}</Text>
                <Text style={styles.modalText}>{renderWithLineBreaks2(breedInfo.nature)}</Text>
                <Text style={styles.modalBreedName}>ลักษณะนิสัยของสุนัขพันธุ์{breedInfo.breed_name}</Text>
                <Text style={styles.modalText}>{breedInfo.charac}</Text>
                <Text style={styles.modalBreedName}>ข้อเสีย</Text>
                <Text style={styles.modalText}>{renderWithLineBreaks2(breedInfo.problem)}</Text>
                <Text style={styles.modalBreedName}>อารหารการกิน</Text>
                <Text style={styles.modalText}>{breedInfo.Nutrition}</Text>
                <Text style={styles.modalBreedName}>ประวัติความเป็นมาของสุนัขพันธุ์</Text>
                <Text style={styles.modalText}>{breedInfo.record}</Text>
              </ScrollView>
            ) : (
              <Text>ไม่พบข้อมูล</Text>
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
    padding: 20,
  },
  petImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  moreButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF9090',
    borderRadius: 10,
    alignItems: 'center',
  },
  moreButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
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
    color: 'gray',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default MyPetInfo;
