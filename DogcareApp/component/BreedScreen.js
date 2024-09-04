import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ScrollView, TextInput, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BreedScreen = () => {
  const [breeds, setBreeds] = useState([]);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation value for modal fade in/out

  useEffect(() => {
    fetch('http://192.168.3.148/dogcare/breedinfo.php')
      .then(response => response.json())
      .then(data => {
        setBreeds(data);
        setFilteredBreeds(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const openModal = (breed) => {
    setSelectedBreed(breed);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBreed(null);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filteredData = breeds.filter(breed =>
      breed.breed_name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBreeds(filteredData);
  };

  const renderBreed = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.card}>
        <Image source={{ uri: item.picture }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.breedName}>{item.breed_name}</Text>
          <Text style={styles.breedRegion}>{item.region}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาสายพันธุ์สุนัข"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredBreeds}
        renderItem={renderBreed}
        keyExtractor={item => item.breed_id.toString()}
      />

      {selectedBreed && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
          animationType="none"
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <View style={styles.modalContent}>
              <TouchableWithoutFeedback onPress={closeModal}>
                <Ionicons name="close" size={30} color="black" style={styles.closeButton} />
              </TouchableWithoutFeedback>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedBreed.picture }} style={styles.modalImage} />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>{selectedBreed.breed_name}</Text>
                    <Text style={styles.modalRegion}>{selectedBreed.region}</Text>
                  </View>
                </View>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>น้ำหนัก: {selectedBreed.weight} กก.   ส่วนสูง: {selectedBreed.height} นิ้ว</Text>
                  <Text style={styles.modalText}>อายุขัย: {selectedBreed.lifespan} ปี</Text>
                  <Text style={styles.modalBreedName}>ลักษณะของสุนัขพันธุ์ {selectedBreed.breed_name}</Text>
                  <Text style={styles.modalText}>{selectedBreed.nature}</Text>
                  <Text style={styles.modalBreedName}>ลักษณะนิสัยของสุนัขพันธุ์ {selectedBreed.breed_name}</Text>
                  <Text style={styles.modalText}>{selectedBreed.charac}</Text>
                  <Text style={styles.modalBreedName}>ข้อเสีย</Text>
                  <Text style={styles.modalText}>{selectedBreed.problem}</Text>
                  <Text style={styles.modalBreedName}>อาหารการกิน</Text>
                  <Text style={styles.modalText}>{selectedBreed.Nutrition}</Text>
                  <Text style={styles.modalBreedName}>ประวัติความเป็นมาของสุนัขพันธุ์</Text>
                  <Text style={styles.modalText}>{selectedBreed.record}</Text>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
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
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
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
  },
  modalTextContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  modalBreedName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalRegion: {
    fontSize: 18,
    color: 'gray',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  modalDetails: {
    marginBottom: 20,
  },
});

export default BreedScreen;
