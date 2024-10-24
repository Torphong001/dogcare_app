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
import Dialog from 'react-native-dialog';

const MyPetInfo = ({ route, navigation }) => {
  const { pet } = route.params;
  const [petinfo, setPetinfo] = useState(pet);
  const [modalVisible, setModalVisible] = useState(false);
  const [breedInfo, setBreedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [updatedPet, setUpdatedPet] = useState({
    pet_name: petinfo.pet_name,
    pet_picture: petinfo.pet_picture,
    breed_name: pet.breed_name,
    pet_weight: petinfo.pet_weight?.toString() ?? "0", // Default to '0' if null
    pet_height: petinfo.pet_height?.toString() ?? "0",
    pet_sex: petinfo.pet_sex,
    pet_bd: petinfo.pet_bd,
  });
  const [selectedImage, setSelectedImage] = useState(null); 
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };
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
        "http://192.168.3.117/dogcare/getbreedinfo.php",
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
      pet_name: petinfo.pet_name,
      pet_picture: petinfo.pet_picture,
      breed_name: petinfo.breed_name,
      pet_weight: petinfo.pet_weight.toString(),
      pet_height: petinfo.pet_height.toString(),
      pet_sex: petinfo.pet_sex,
      pet_bd: petinfo.pet_bd,
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
        "http://192.168.3.117/dogcare/editpetinfo.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data.success) {
        showDialog("แก้ไขข้อมูลสำเร็จ");
        setIsEditing(false);
        const updatedPetResponse = await axios.get(`http://192.168.3.117/dogcare/getpetupdate.php?pet_id=${pet.pet_id}`);
        setPetinfo(updatedPetResponse.data);
      } else {
        showDialog("แก้ไขข้อมูลผิดพลาด");
      }
    } catch (error) {
      console.error("Error updating pet info:", error);
      Alert.alert("Error", "An error occurred while updating pet information.");
    }
  };
  

  const handleDelete = async () => {
    Alert.alert(
      "ยืนยันการลบข้อมูลสุนัข",
      "แน่ใจแล้วใช่หรือไม่ที่จะลบข้อมูลสุนัข?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          onPress: async () => {
            try {
              const response = await axios.post(
                "http://192.168.3.117/dogcare/deletepet.php",
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
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const pickImage  = () => {
    Alert.alert(
      "เลือกตัวเลือก",
      "คุณต้องการใช้ภาพจากกล้องหรือคลัง?",
      [
        {
          text: "ถ่ายรูป",
          onPress: takePhotoWithCamera,
        },
        {
          text: "เลือกรูปจากคลัง",
          onPress: pickImageFromGallery,
        },
        {
          text: "ยกเลิก",
          style: "cancel",
        },
      ]
    );
  };
  const formatTextWithNewLine = (text) => {
    // ตรวจสอบว่า text เป็น undefined หรือไม่ ถ้าเป็น ให้ส่งกลับเป็น Text ว่าง
    if (!text) {
      return <Text></Text>;
    }
  
    const lines = text.split("|");
    return lines.map((line, index) => (
      <Text key={index}>
        {line}
        {index < lines.length - 1 && <Text>{'\n'}</Text>}
      </Text>
    ));
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
                source={{ uri: `http://192.168.3.117/dogcare/uploads/${petinfo.pet_pic}` }}
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
          <Text style={styles.valueCentered}>{petinfo.pet_name}</Text>
        )}

        <Text style={styles.label}>สายพันธุ์:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={updatedPet.breed_name}
            onChangeText={(text) =>
              setUpdatedPet({ ...updatedPet, breed_name: text })
            }
            editable={false} // ปิดการแก้ไขค่า
          />
        ) : (
          <Text style={styles.value}>{pet.breed_name}</Text>
        )}

        <View style={styles.inlineContainer}>
         {/* เพศ */}
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
              <View style={styles.radioItem}>
                <RadioButton.Android
                  value="M"
                  status={updatedPet.pet_sex === 'M' ? 'checked' : 'unchecked'}
                  color="#ff7f50"
                  uncheckedColor="#ccc"
                  style={styles.radioButton}
                />
                <Text style={styles.radioLabel}>ผู้</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton.Android
                  value="F"
                  status={updatedPet.pet_sex === 'F' ? 'checked' : 'unchecked'}
                  color="#ff7f50"
                  uncheckedColor="#ccc"
                  style={styles.radioButton}
                />
                <Text style={styles.radioLabel}>เมีย</Text>
              </View>
            </View>
          </RadioButton.Group>
        ) : (
          <Text style={styles.value}>
            {petinfo.pet_sex === "M" ? "ผู้" : petinfo.pet_sex === "F" ? "เมีย" : "ไม่ระบุ"}
          </Text>
        )}
      </View>

      {/* อายุ */}
      <View style={styles.inlineItem}>
        <Text style={styles.label}>อายุ:</Text>
        {isEditing ? (
          <>
            <TouchableOpacity onPress={showDatePickerHandler} style={styles.dateButton}>
              <Text style={styles.dateText}>
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
          <Text style={styles.value}>{calculateAge(petinfo.pet_bd)}</Text>
        )}
      </View>
    </View>

        <View style={styles.inlineContainer}>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>น้ำหนัก:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input2}
                value={updatedPet.pet_weight}
                onChangeText={(text) =>
                  setUpdatedPet({ ...updatedPet, pet_weight: text })
                }
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{petinfo.pet_weight} กก.</Text>
            )}
          </View>
          <View style={styles.inlineItem}>
            <Text style={styles.label}>ส่วนสูง:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input2}
                value={updatedPet.pet_height}
                onChangeText={(text) =>
                  setUpdatedPet({ ...updatedPet, pet_height: text })
                }
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{petinfo.pet_height} นิ้ว</Text>
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
          <Text style={styles.moreButtonText}>ดูข้อมูลสายพันธุ์เพิ่มเติม</Text>
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
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.modalHeader}>
                  <Image
                    source={{
                      uri: `http://192.168.3.117/dogcare/uploads/${breedInfo.picture}`,
                    }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>
                      {breedInfo.breed_name}
                    </Text>
                    <Text style={styles.modalRegion}>
                      {breedInfo.region}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>
                    น้ำหนัก: {breedInfo.weight} กก. ส่วนสูง:{" "}
                    {breedInfo.height} นิ้ว
                  </Text>
                  <Text style={styles.modalText}>
                    อายุขัย: {breedInfo.lifespan} ปี
                  </Text>
                  <View style={styles.modalDetails}>
                    <Text style={styles.modalBreedName}>
                      ลักษณะของสุนัขพันธุ์:
                    </Text>
                    {breedInfo.picturedetail && (
                      <>
                        {breedInfo.picturedetail
                          .split("|")
                          .map((url, index) =>
                            index === 0 && url ? (
                              <Image
                                key={index}
                                source={{
                                  uri: `http://192.168.3.117/dogcare/uploads/${url}`,
                                }}
                                style={styles.modalImagedetail}
                              />
                            ) : null
                          )}
                      </>
                    )}
                    <Text style={styles.modalText}>
                    {formatTextWithNewLine(breedInfo.nature)}
                    </Text>
                  </View>
                  <Text style={styles.modalBreedName}>
                    ลักษณะนิสัยของสุนัขพันธุ์ {breedInfo.breed_name}
                  </Text>
                  {breedInfo.picturedetail && (
                      <>
                        {breedInfo.picturedetail
                          .split("|")
                          .map((url, index) =>
                            index === 1 && url ? (
                              <Image
                                key={index}
                                source={{
                                  uri: `http://192.168.3.117/dogcare/uploads/${url}`,
                                }}
                                style={styles.modalImagedetail}
                              />
                            ) : null
                          )}
                      </>
                    )}
                  <Text style={styles.modalText}>{breedInfo.charac}</Text>
                  <Text style={styles.modalBreedName}>ข้อควรระวัง</Text>
                  {breedInfo.picturedetail && (
                      <>
                        {breedInfo.picturedetail
                          .split("|")
                          .map((url, index) =>
                            index === 2 && url ? (
                              <Image
                                key={index}
                                source={{
                                  uri: `http://192.168.3.117/dogcare/uploads/${url}`,
                                }}
                                style={styles.modalImagedetail}
                              />
                            ) : null
                          )}
                      </>
                    )}
                  <Text style={styles.modalText}>{formatTextWithNewLine(breedInfo.problem)}</Text>
                  <Text style={styles.modalBreedName}>โภชนาการ</Text>
                  <Text style={styles.modalText}>
                    {formatTextWithNewLine(breedInfo.Nutrition)}
                  </Text>
                  <Text style={styles.modalBreedName}>
                    ประวัติความเป็นมาของสุนัขพันธุ์
                  </Text>
                  {breedInfo.picturedetail && (
                      <>
                        {breedInfo.picturedetail
                          .split("|")
                          .map((url, index) =>
                            index === 3 && url ? (
                              <Image
                                key={index}
                                source={{
                                  uri: `http://192.168.3.117/dogcare/uploads/${url}`,
                                }}
                                style={styles.modalImagedetail}
                              />
                            ) : null
                          )}
                      </>
                    )}
                  <Text style={styles.modalText}>{breedInfo.record}</Text>
                </View>
              </ScrollView>
            ) : (
              <Text>ข้อมูลไม่พบ</Text>
            )}
          </View>
        </View>
      </Modal>
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Description>
          {dialogMessage}
        </Dialog.Description>
        <Dialog.Button label="ตกลง" onPress={() => setDialogVisible(false)} />
      </Dialog.Container>
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
    width: "100%",
    borderRadius: 5,
    backgroundColor: "white",
  },
  input2: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    marginLeft: 10,
    width: "90%",
    borderRadius: 5,
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  moreButton: {
    backgroundColor: "#EA7D70",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    marginTop: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  modalTextContainer: {
    marginLeft: 15,
    justifyContent: "center",
  },
  modalBreedName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "blue",
  },
  modalRegion: {
    fontSize: 15,
    color: "gray",
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
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  radioLabel: {
    fontSize: 16, // ปรับขนาดตัวหนังสือให้เล็กลง
    color: '#333',
    marginLeft: 5, // ลดช่องว่างระหว่างปุ่มกับข้อความ
  },
  dateButton: {
    backgroundColor: '#FF8D8D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  dateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalImagedetail: {
    marginTop: 10,
    width: 300,
    height: 150,
    borderRadius: 10,
  },
});

export default MyPetInfo;
