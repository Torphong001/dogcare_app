import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const MypetScreen = ({ navigation, setUserToken }) => {
  const [userInfo, setUserInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        setToken(storedToken);
        console.log('Token:', storedToken);

        if (storedToken) {
          const response = await axios.get('http://192.168.3.180/dogcare/getpets.php', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          console.log('Response:', response.data);
          if (response.data.error) {
            console.error(response.data.error);
          } else {
            setUserInfo(response.data);
          }
        } else {
          console.error('Token not found');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    navigation.navigate('Login');
  };

  const openModal = (pet) => {
    setSelectedPet(pet);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPet(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      {item.pet_pic ? (
        <Image source={{ uri: item.pet_pic }} style={styles.image} />
      ) : (
        <FontAwesome name="user" size={100} color="gray" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.breedName}>{item.pet_name}</Text>
        <Text style={styles.breedRegion}>สายพันธุ์: {item.breed_name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...userInfo, { addNew: true }]} // Add a dummy item at the end for the add new card
        renderItem={({ item }) => item.addNew ? (
          <TouchableOpacity style={[styles.card, styles.addCard]} onPress={() => navigation.navigate('AddPetScreen')}>
            <Ionicons name="add-circle-outline" size={50} color="gray" />
          </TouchableOpacity>
        ) : renderItem({ item })}
        keyExtractor={(item, index) => index.toString()}
      />

      {selectedPet && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableWithoutFeedback onPress={closeModal}>
                <Ionicons name="close" size={30} color="black" style={styles.closeButton} />
              </TouchableWithoutFeedback>
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedPet.pet_pic }} style={styles.modalImage} />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>{selectedPet.pet_name}</Text>
                    <Text style={styles.modalRegion}>สายพันธุ์: {selectedPet.breed_name}</Text>
                  </View>
                </View>
                <Text style={styles.modalText}>น้ำหนัก: {selectedPet.pet_weight}</Text>
                <Text style={styles.modalText}>ส่วนสูง: {selectedPet.pet_height}</Text>
                <Text style={styles.modalText}>เพศ: {selectedPet.pet_sex}</Text>
                <Text style={styles.modalText}>อายุ: {selectedPet.pet_bd}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120, // Adjust the height as needed
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  breedName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  breedRegion: {
    marginTop: 5,
    fontSize: 14,
    color: 'gray',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  modalTextContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  modalBreedName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalRegion: {
    fontSize: 16,
    color: 'gray',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MypetScreen;
