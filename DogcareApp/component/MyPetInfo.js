import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RadioButton } from 'react-native-paper'; // นำเข้า RadioButton
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const MyPetInfo = ({ route, navigation }) => {
  const { pet } = route.params;
  const [petinfo, setPetinfo] = useState(pet);
  const [modalVisible, setModalVisible] = useState(false);
  const [breedInfo, setBreedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [updatedPet, setUpdatedPet] = useState({
    pet_name: pet.pet_name,
    pet_picture: pet.pet_picture,
    breed_name: pet.breed_name,
    pet_weight: pet.pet_weight?.toString() ?? "0", // Default to '0' if null
    pet_height: pet.pet_height?.toString() ?? "0",
    pet_sex: pet.pet_sex,
    pet_bd: pet.pet_bd,
  });
  const [selectedImage, setSelectedImage] = useState(null); 

  const calculateAge = (birthDate) => {
    const birthMoment = moment(birthDate, "YYYY-MM-DD");
    const currentMoment = moment();
    const years = currentMoment.diff(birthMoment, "years");
    birthMoment.add(years, "years");
    const months = currentMoment.diff(birthMoment, "months");
    return `${years} ปี ${months} เดือน`;
  };

  const fetchBreedInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.3.82/dogcare/getbreedinfo.php",
        { breed_id: pet.breed_id }
      );
      setBreedInfo(response.data);
    } catch (error) {
      console.error("Error fetching breed info:", error);
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
      pet_picture: pet.pet_picture,
      breed_name: pet.breed_name,
      pet_weight: pet.pet_weight.toString(),
      pet_height: pet.pet_height.toString(),
      pet_sex: pet.pet_sex,
      pet_bd: pet.pet_bd,
    });
    setSelectedImage(null); // Clear the selected image
    setIsEditing(false);
  };
  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUpdatedPet({
        ...updatedPet,
        pet_bd: moment(selectedDate).format("YYYY-MM-DD"),
      });
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("pet_id", pet.pet_id);
      formData.append("pet_name", updatedPet.pet_name);
      formData.append("breed_name", updatedPet.breed_name);
      formData.append("pet_weight", updatedPet.pet_weight?.toString() ?? "0"); // แปลงเป็น string หรือใช้ค่าเริ่มต้น '0'
      formData.append("pet_height", updatedPet.pet_height?.toString() ?? "0");
      formData.append("pet_bd", updatedPet.pet_bd);
      formData.append("pet_sex", updatedPet.pet_sex);
      if (selectedImage) {
      formData.append('picture', {
        uri: selectedImage.uri,
        name: selectedImage.fileName,
        type: selectedImage.mimeType,
      });
    }
    console.log(formData);
      const response = await axios.post(
        "http://192.168.3.82/dogcare/editpetinfo.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data.success) {
        Alert.alert("Success", "Pet information updated successfully!");
        setIsEditing(false);
        const updatedPetResponse = await axios.get(`http://192.168.3.82/dogcare/getpetupdate.php?pet_id=${pet.pet_id}`);
        setUpdatedPet(updatedPetResponse.data);
      } else {
        Alert.alert("Error", "Failed to update pet information.");
      }
    } catch (error) {
      console.error("Error updating pet info:", error);
      Alert.alert("Error", "An error occurred while updating pet information.");
    }
  };
  

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this pet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const response = await axios.post(
                "http://192.168.3.82/dogcare/deletepet.php",
                { pet_id: pet.pet_id }
              );
              if (response.data.success) {
                Alert.alert("Success", "Pet deleted successfully!");
                navigation.goBack(); // Navigate back after deleting
              } else {
                Alert.alert("Error", "Failed to delete pet.");
              }
            } catch (error) {
              console.error("Error deleting pet:", error);
              Alert.alert("Error", "An error occurred while deleting the pet.");
            }
          },
        },
      ],
      { cancelable: true }
    );
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
      mediaTypes: ImagePicker.MediaTypeOptions.All, // เปลี่ยนเป็น All เพื่อรองรับทุกประเภท
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={isEditing ? pickImage : null}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={[styles.petImage, isEditing && styles.imageEditing]}
            />
          ) : (
            pet.pet_pic ? (
              <Image
                source={{ uri: `http://192.168.3.82/dogcare/uploads/${pet.pet_pic}` }}
                style={[styles.petImage, isEditing && styles.imageEditing]}
              />
            ) : (
              <FontAwesome name="user" size={100} color="gray" />
            )
          )}
          {isEditing && (
            <View style={styles.iconOverlay}>
              <FontAwesome name="pencil" size={30} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.labelCentered}>ชื่อ:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={updatedPet.pet_name}
            onChangeText={(text) =>
              setUpdatedPet({ ...updatedPet, pet_name: text })
            }
          />
        ) : (
          <Text style={styles.valueCentered}>{pet.pet_name}</Text>
        )}

        <Text style={styles.label}>สายพันธุ์:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={updatedPet.breed_name}
            onChangeText={(text) =>
              setUpdatedPet({ ...updatedPet, breed_name: text })
            }
          />
        ) : (
          <Text style={styles.value}>{pet.breed_name}</Text>
        )}

        <View style={styles.inlineContainer}>
        <View style={styles.inlineItem}>
          <Text style={styles.label}>เพศ:</Text>
          {isEditing ? (
            <RadioButton.Group
              onValueChange={(newValue) =>
                setUpdatedPet({ ...updatedPet, pet_sex: newValue })
              }
              value={updatedPet.pet_sex}
            >
              <View style={styles.radioContainer}>
                <RadioButton.Item label="ชาย" value="M" />
                <RadioButton.Item label="หญิง" value="F" />
              </View>
            </RadioButton.Group>
          ) : (
            <Text style={styles.value}>
              {pet.pet_sex === "M" ? "ชาย" : pet.pet_sex === "F" ? "หญิง" : "ไม่ระบุ"}
            </Text>
          )}
        </View>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>อายุ:</Text>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={showDatePickerHandler}>
                  <Text style={styles.value}>
                    {updatedPet.pet_bd || "เลือกวันเกิด"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(updatedPet.pet_bd || Date.now())}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </>
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
                onChangeText={(text) =>
                  setUpdatedPet({ ...updatedPet, pet_weight: text })
                }
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
                onChangeText={(text) =>
                  setUpdatedPet({ ...updatedPet, pet_height: text })
                }
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{pet.pet_height} นิ้ว</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.moreButton,
              { backgroundColor: isEditing ? "#4CAF50" : "#FF9090" },
            ]}
            onPress={isEditing ? handleSave : handleEditToggle}
          >
            <Text style={styles.moreButtonText}>
              {isEditing ? "บันทึก" : "แก้ไข"}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={[styles.moreButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.moreButtonText}>ยกเลิก</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.moreButton, { backgroundColor: "#FF4500" }]}
            onPress={handleDelete}
          >
            <Text style={styles.moreButtonText}>ลบ</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={fetchBreedInfo}>
          <Text style={styles.moreButtonText}>ดูเพิ่มเติม</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate("Notipet", { pet_id: pet.pet_id })}
        >
          <Text style={styles.moreButtonText}>แจ้งเตือน</Text>
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : breedInfo ? (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Image
                    source={{ uri: breedInfo.picture }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>
                      {breedInfo.breed_name}
                    </Text>
                    <Text style={styles.modalRegion}>{breedInfo.region}</Text>
                  </View>
                </View>
                <Text style={styles.modalDescription}>
                  {breedInfo.description}
                </Text>
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
    alignItems: "center",
    padding: 20,
  },
  petImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  infoContainer: {
    width: "100%",
  },
  inlineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inlineItem: {
    flex: 1,
  },
  labelCentered: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  valueCentered: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  moreButton: {
    backgroundColor: "#FF9090",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  moreButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 5,
  },
});

export default MyPetInfo;
