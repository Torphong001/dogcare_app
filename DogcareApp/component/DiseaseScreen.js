import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,  // นำเข้า TextInput
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";

const DiseaseScreen = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);  // สร้าง state สำหรับอาการที่กรองแล้ว
  const [searchQuery, setSearchQuery] = useState("");  // สร้าง state สำหรับการค้นหา
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDiseaseInfo, setSelectedDiseaseInfo] = useState(null);

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get(
        "http://192.168.3.117/dogcare/symptominfo.php"
      );
      setSymptoms(response.data);
      setFilteredSymptoms(response.data);  // ตั้งค่าเริ่มต้นเป็นอาการทั้งหมด
    } catch (error) {
      console.error("Error fetching symptoms:", error);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  // ฟังก์ชันสำหรับการค้นหาอาการ
  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = symptoms.filter((symptom) =>
      symptom.symptom_name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSymptoms(filtered);
  };

  const handleSelectSymptom = (symptom) => {
    setSelectedSymptoms((prevSelected) => {
      if (prevSelected.includes(symptom)) {
        return prevSelected.filter((item) => item !== symptom);
      } else {
        return [...prevSelected, symptom];
      }
    });
  };

  const handleEvaluateDisease = async () => {
    try {
      if (selectedSymptoms.length === 0) {
        console.error("No symptoms selected");
        return;
      }

      const response = await axios.post(
        "http://192.168.3.117/dogcare/riskdisease.php",
        {
          symptoms: selectedSymptoms,
        }
      );

      const { exactMatches, partialMatches } = response.data;
      setDiseases([
        {
          title: "โรคที่ตรงกับอาการ :",
          diseases:
            exactMatches.length > 0
              ? exactMatches
              : ["ไม่พบโรคที่ตรงกับอาการ"],
        },
        {
          title: "โรคที่ใกล้เคียงกับอาการ :",
          diseases:
            partialMatches.length > 0
              ? partialMatches
              : ["ไม่พบโรคที่ใกล้เคียงกับอาการ"],
        },
      ]);
      setIsEvaluated(true);
    } catch (error) {
      console.error("Error sending symptoms:", error);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setDiseases([]);
    setIsEvaluated(false);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedSymptoms.includes(item.symptom_name);
    return (
      <TouchableOpacity
        onPress={() => handleSelectSymptom(item.symptom_name)}
        style={[styles.item, isSelected && styles.selectedItem]}
      >
        <Text style={styles.itemText}>{item.symptom_name}</Text>
        {isSelected && <Icon name="check" style={styles.checkIcon} />}
      </TouchableOpacity>
    );
  };

  const renderDiseaseItem = (disease, index) => {
    const isDisabled =
      disease === "ไม่พบโรคที่ตรงกับอาการ" ||
      disease === "ไม่พบโรคที่ใกล้เคียงกับอาการ";
  
    return (
      <TouchableOpacity
        key={index}
        style={[styles.diseaseButton, isDisabled && styles.disabledButton]}
        onPress={() => !isDisabled && handleSendDisease(disease)}
        disabled={isDisabled}
      >
        <Text style={[styles.diseaseText, isDisabled && styles.disabledText]}>
          {disease}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSendDisease = async (disease) => {
    try {
      const response = await axios.get('http://192.168.3.117/dogcare/diseases.php', { params: { disease } });
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSelectedDiseaseInfo(response.data[0]);
      } else {
        setSelectedDiseaseInfo(response.data);
      }
      setModalVisible(true);
    } catch (error) {
      console.error('Error sending disease:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDiseaseInfo(null);
  };

  const formatTextWithNewLine = (text) => {
    const lines = text.split("|");
    return lines.map((line, index) => (
      <Text key={index}>
        {line}
        {index < lines.length - 1 && "\n"}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.texttitle}>กรุณาระบุอาการของสุนัข</Text>
      <Text style={styles.texttitle}>(เลือกได้หลายอาการ) </Text>

      {/* ช่องค้นหาอาการ */}
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาอาการ"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredSymptoms}  // ใช้อาการที่ถูกกรองแล้ว
        keyExtractor={(item) => item.symptom_id.toString()}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
      />
      <TouchableOpacity
        style={styles.evaluateButton}
        onPress={isEvaluated ? handleReset : handleEvaluateDisease}
        disabled={selectedSymptoms.length === 0}
      >
        <Text style={styles.evaluateButtonText}>
          {isEvaluated ? "เริ่มใหม่" : "ค้นหาโรคจากอาการ"}
        </Text>
      </TouchableOpacity>

      <View style={styles.diseaseContainer}>
        {diseases.length > 0 &&
          diseases.map((group, index) => (
            <View key={index}>
              <Text style={styles.diseaseTitle}>{group.title}</Text>
              {group.diseases.map((disease, i) =>
                renderDiseaseItem(disease, i)
              )}
            </View>
          ))}
      </View>

      {/* ป๊อปอัปสำหรับแสดงข้อมูลโรค */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            {selectedDiseaseInfo ? (
              <ScrollView>
                <Text style={styles.modalTitle}>
                  {selectedDiseaseInfo.diseases_name || "ไม่มีข้อมูล"}
                </Text>
                <Text style={styles.modalSectionTitle}>อาการ:</Text>
                <Text style={styles.modalSectionText}>{formatTextWithNewLine(selectedDiseaseInfo.symptom) || "ไม่มีข้อมูล"}</Text>
                <Text style={styles.modalSectionTitle}>การรักษา:</Text>
                <Text style={styles.modalSectionText}>{formatTextWithNewLine(selectedDiseaseInfo.treat) || "ไม่มีข้อมูล"}</Text>
              </ScrollView>
            ) : (
              <Text>กำลังโหลดข้อมูล...</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  item: {
    flex: 1,
    margin: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    elevation: 2,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  selectedItem: {
    backgroundColor: "#cce7ff",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  checkIcon: {
    position: "absolute",
    top: 1,
    right: 1,
    color: "green",
    fontSize: 20,
  },
  columnWrapper: {
    justifyContent: "flex-start",
  },
  diseaseContainer: {
    marginTop: 20,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  diseaseButton: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#cce7ff",
    borderRadius: 5,
    alignItems: "center",
  },
  diseaseText: {
    fontSize: 16,
    color: "#555",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledText: {
    color: "#999",
  },
  evaluateButton: {
    backgroundColor: "#FF9090",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 0,
  },
  evaluateButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  texttitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 1,
    textAlign: "center",
    color: "blue",
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 1,
    color: "blue",
  },
  modalSectionText: {
    fontSize: 16,
    marginBottom: 1,
  },
});

export default DiseaseScreen;
