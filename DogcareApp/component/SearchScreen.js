import React, { useEffect,useState , useRef} from "react";
import {
  View,
  Button,
  Image,
  StyleSheet,
  Alert,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Buffer } from "buffer";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const SearchScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [showBreedButton, setShowBreedButton] = useState(false);
  const [topBreeds, setTopBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation value for modal fade in/out

  // ฟังก์ชันสำหรับเลือกภาพ
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("ต้องอนุญาตการเข้าถึงคลังภาพก่อนถึงจะเลือกภาพได้");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      setShowBreedButton(true);
      setTopBreeds([]); // รีเซ็ตผลการระบุเมื่อเลือกภาพใหม่
    }
  };
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
  // ฟังก์ชันสำหรับตรวจจับสายพันธุ์
  const handleBreedDetection = async () => {
    if (!imageUri) {
      Alert.alert("กรุณาเลือกภาพก่อน");
      return;
    }

    try {
      const imgData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        "https://dogpredic.cognitiveservices.azure.com/customvision/v3.0/Prediction/49504ade-0b92-49ef-abe8-ee1b7d3c2066/classify/iterations/Iteration1/image",
        Buffer.from(imgData, "base64"),
        {
          headers: {
            "Prediction-Key": "d6a8928da71147899d1d40a58d428238",
            "Content-Type": "application/octet-stream",
          },
        }
      );

      const predictions = response.data.predictions;
      const results = predictions.map((prediction) => ({
        name: prediction.tagName,
        percentage: (prediction.probability * 100).toFixed(2),
      }));

      setTopBreeds(
        results.sort((a, b) => b.percentage - a.percentage).slice(0, 3)
      );
    } catch (error) {
      console.error("Error during prediction:", error);
    }
  };

  // ฟังก์ชันสำหรับแสดงรายละเอียดพันธุ์
  const handleBreedDetails = async (breedname) => {
    try {
      const response = await axios.post(
        "http://192.168.3.82/dogcare/getbreedpredic.php",
        { breed_name: breedname }
      );
      const breedData = response.data;

      setSelectedBreed(breedData);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching breed details:", error);
    }
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
    <View style={styles.container}>
      <TouchableOpacity
        onPress={pickImage}
        style={styles.detailButtonselect}
        activeOpacity={0.7} // ลดความเข้มของปุ่มเมื่อกด
      >
        <Text style={styles.buttonText}>เลือกรูปภาพ</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {showBreedButton && (
        <TouchableOpacity
          onPress={handleBreedDetection}
          style={styles.detailButtonselect2}
          activeOpacity={0.7} // ลดความเข้มของปุ่มเมื่อกด
        >
          <Text style={styles.buttonText}>ตรวจสอบสายพันธุ์</Text>
        </TouchableOpacity>
      )}
      {topBreeds.length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>ผลตรวจสอบสายพันธุ์</Text>
          {topBreeds.map((breed, index) => (
            <View key={index} style={styles.breedRow}>
              {/* Column 1: ลำดับที่ */}
              <Text style={styles.breedIndex}>{index + 1}.</Text>

              {/* Column 2: ชื่อสายพันธุ์ */}
              <Text style={styles.breedName}>{breed.name}</Text>

              {/* Column 3: เปอร์เซ็น */}
              <Text style={styles.breedPercentage}>{breed.percentage}%</Text>

              {/* Column 4: ดูรายละเอียด */}
              <TouchableOpacity
                onPress={() => handleBreedDetails(breed.name)}
                style={styles.detailButton}
              >
                <Text style={styles.detailButtonText}>ดูเพิ่มเติม</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="none"
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <View style={styles.modalContent}>
              <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={30}
                  color="black"
                  style={styles.closeButton}
                />
              </TouchableWithoutFeedback>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.modalHeader}>
                  <Image
                    source={{
                      uri: `http://192.168.3.82/dogcare/uploads/${selectedBreed.picture}`,
                    }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalBreedName}>
                      {selectedBreed.breed_name}
                    </Text>
                    <Text style={styles.modalRegion}>
                      {selectedBreed.region}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>
                    น้ำหนัก: {selectedBreed.weight} กก. ส่วนสูง:{" "}
                    {selectedBreed.height} นิ้ว
                  </Text>
                  <Text style={styles.modalText}>
                    อายุขัย: {selectedBreed.lifespan} ปี
                  </Text>
                  <View style={styles.modalDetails}>
                    <Text style={styles.modalBreedName}>
                      ลักษณะของสุนัขพันธุ์:
                    </Text>
                    {formatTextWithNewLine(selectedBreed.nature)}
                  </View>
                  <Text style={styles.modalBreedName}>
                    ลักษณะนิสัยของสุนัขพันธุ์ {selectedBreed.breed_name}
                  </Text>
                  <Text style={styles.modalText}>{formatTextWithNewLine(selectedBreed.charac)}</Text>
                  <Text style={styles.modalBreedName}>ข้อเสีย</Text>
                  <Text style={styles.modalText}>{formatTextWithNewLine(selectedBreed.problem)}</Text>
                  <Text style={styles.modalBreedName}>โภชนาการ</Text>
                  <Text style={styles.modalText}>
                    {formatTextWithNewLine(selectedBreed.Nutrition)}
                  </Text>
                  <Text style={styles.modalBreedName}>
                    ประวัติความเป็นมาของสุนัขพันธุ์
                  </Text>
                  <Text style={styles.modalText}>{formatTextWithNewLine(selectedBreed.record)}</Text>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
  resultContainer: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginVertical: 10,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  breedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  breedIndex: {
    fontSize: 16,
    fontWeight: "bold",
    width: "10%",
    textAlign: "center",
  },
  breedName: {
    fontSize: 16,
    width: "50%",
  },
  breedPercentage: {
    fontSize: 16,
    width: "20%",
    textAlign: "right",
  },
  detailButtonText: {
    color: "black", // สีข้อความในปุ่ม
    fontSize: 12,
    fontWeight: "semibold",
  },
  detailButton: {
    padding: 5,
    backgroundColor: "#FF9090", // สีพื้นหลังปุ่ม
    borderRadius: 20,
    width: "20%",
    alignItems: "center",
  },
  detailButtonselect: {
    padding: 10,
    backgroundColor: "#FF9090", // สีพื้นหลังปุ่ม
    borderRadius: 20,
    width: "35%",
    alignItems: "center",
  },
  detailButtonselect2: {
    padding: 10,
    backgroundColor: "#FF9090", // สีพื้นหลังปุ่ม
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    marginTop: 20,
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
  },
  modalRegion: {
    fontSize: 18,
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
});

export default SearchScreen;