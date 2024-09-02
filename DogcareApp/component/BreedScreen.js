import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo; otherwise, install react-native-vector-icons

const BreedScreen = () => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetch('http://192.168.3.180/dogcare/breedinfo.php') // Replace with your actual API URL
      .then(response => response.json())
      .then(data => setBreeds(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const openModal = (breed) => {
    setSelectedBreed(breed);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBreed(null);
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
  const renderWithLineBreaks = (text) => {
    return text.split(' ').map((word, index) => (
      <Text key={index} style={styles.modalText}>
        {word}
      </Text>
    ));
  };
  const renderWithLineBreaks2 = (text) => {
    return text.split('|').map((line, index) => (
      <Text key={index} style={styles.modalText}>
        {line}
        {index < text.split('|').length - 1 && <Text>{'\n'}</Text>}
      </Text>
    ));
  };
  
  
  return (
    <View style={styles.container}>
      <FlatList
        data={breeds}
        renderItem={renderBreed}
        keyExtractor={item => item.breed_id.toString()}
      />
      
      {selectedBreed && (
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
                  <Image source={{ uri: selectedBreed.picture }} style={styles.modalImage} />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>{selectedBreed.breed_name}</Text>
                    <Text style={styles.modalRegion}>{selectedBreed.region}</Text>
                  </View>
                </View>
                <Text style={styles.modalText}>น้ำหนัก: {selectedBreed.weight} กก.   ส่วนสูง: {selectedBreed.height} นิ้ว</Text>
                <Text style={styles.modalText}>อายุขัย: {selectedBreed.lifespan} ปี</Text>
                <Text style={styles.modalBreedName}>ลักษณะของสุนัขพันธุ์{selectedBreed.breed_name}</Text>
                <Text style={styles.modalText}>{renderWithLineBreaks2(selectedBreed.nature)}</Text>
                <Text style={styles.modalBreedName}>ลักษณะนิสัยของสุนัขพันธุ์{selectedBreed.breed_name}</Text>
                <Text style={styles.modalText}>{selectedBreed.charac}</Text>
                <Text style={styles.modalBreedName}>ข้อเสีย</Text>
                <Text style={styles.modalText}> {renderWithLineBreaks2(selectedBreed.problem)}</Text>
                <Text style={styles.modalBreedName}>อารหารการกิน</Text>
                <Text style={styles.modalText}>{selectedBreed.Nutrition}</Text>
                <Text style={styles.modalBreedName}>ประวัติความเป็นมาของสุนัขพันธุ์</Text>
                <Text style={styles.modalText}> {selectedBreed.record}</Text>
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
  image: {
    width: 100,
    height: 100,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '90%', // Nearly full-screen
    height: '90%', // Nearly full-screen
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
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

export default BreedScreen;
