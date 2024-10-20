import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";

const DiseaseScreen = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDiseaseInfo, setSelectedDiseaseInfo] = useState(null);

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get(
        "http://192.168.50.72/dogcare/symptominfo.php"
      );
      setSymptoms(response.data);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

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
        "http://192.168.50.72/dogcare/riskdisease.php",
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
              : ["ไม่พบโรคที่มีความเสี่ยงสูง"],
        },
        {
          title: "โรคที่ใกล้เคียงกับอาการ :",
          diseases:
            partialMatches.length > 0
              ? partialMatches
              : ["ไม่พบโรคที่มีความเสี่ยงต่ำ"],
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
      disease === "ไม่พบโรคที่มีความเสี่ยงสูง" ||
      disease === "ไม่พบโรคที่มีความเสี่ยงต่ำ";
  
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
      const response = await axios.get('http://192.168.50.72/dogcare/diseases.php', { params: { disease } });
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
      <FlatList
        data={symptoms}
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
          {isEvaluated ? "เริ่มใหม่" : "ประเมินโรค"}
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
                <Text>{formatTextWithNewLine(selectedDiseaseInfo.symptom) || "ไม่มีข้อมูล"}</Text>
                <Text style={styles.modalSectionTitle}>การรักษา:</Text>
                <Text>{formatTextWithNewLine(selectedDiseaseInfo.treat) || "ไม่มีข้อมูล"}</Text>
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
  evaluateButton: {
    backgroundColor: "#FF9090",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  evaluateButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 350,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: "#e0e0e0", // สีปุ่มเมื่อกดไม่ได้
  },
  disabledText: {
    color: "#a0a0a0", // สีข้อความเมื่อกดไม่ได้
  },
});

export default DiseaseScreen;
