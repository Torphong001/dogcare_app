import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import Dialog from "react-native-dialog";

const NotiPet = ({ route }) => {
  const { pet_id } = route.params;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notiName, setNotiName] = useState("");
  const [notiDetail, setNotiDetail] = useState("");
  const [notiTime, setNotiTime] = useState(new Date());
  const [notiDate, setNotiDate] = useState(new Date()); // เพิ่ม notiDate
  const [notiDayType, setNotiDayType] = useState("only");
  const [notiSpecificDays, setNotiSpecificDays] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // เพิ่ม showDatePicker
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const dayOptions = [
    { label: "วันอาทิตย์", value: "Su" },
    { label: "วันจันทร์", value: "Mo" },
    { label: "วันอังคาร", value: "Tu" },
    { label: "วันพุธ", value: "We" },
    { label: "วันพฤหัส", value: "Th" },
    { label: "วันศุกร์", value: "Fr" },
    { label: "วันเสาร์", value: "Sa" },
  ];

  useEffect(() => {
    const fetchPetNotification = async () => {
      try {
        const response = await axios.post(
          "http://192.168.50.72/dogcare/notipet.php",
          { pet_id }
        );
        if (response.data.success) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error(
          "Error fetching pet notifications:",
          error.response || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPetNotification();
  }, [pet_id]);

  const handleCancel = () => {
    setModalVisible(false);
    setNotiName("");
    setNotiDetail("");
    setNotiTime(new Date());
    setNotiDate(new Date()); // รีเซ็ต notiDate
    setNotiDayType("only");
    setNotiSpecificDays([]);
  };
  const handleAddNotification = async () => {
    const formattedTime = `${notiTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${notiTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`;

    let formattedDay = null;
    let formattedDate = null;
    if (notiDayType === "only") {
      formattedDate = `${notiDate.getFullYear()}-${(notiDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${notiDate.getDate().toString().padStart(2, "0")}`;
    } else if (notiDayType === "everyday") {
      formattedDay = "Su|Mo|Tu|We|Th|Fr|Sa";
    } else {
      formattedDay = notiSpecificDays.join("|");
    }
    console.log(formattedTime, formattedDay, formattedDate);
    try {
      const response = await axios.post(
        "http://192.168.50.72/dogcare/addnoti.php",
        {
          noti_name: notiName,
          noti_detail: notiDetail,
          noti_time: formattedTime,
          noti_day: formattedDay,
          noti_date: formattedDate,
          noti_pet_id: pet_id,
        }
      );

      if (response.data.success) {
        setNotifications([
          ...notifications,
          {
            noti_name: notiName,
            noti_time: formattedTime,
            noti_day: formattedDay,
          },
        ]);
        showDialog("เพิ่มการแจ้งเตือนสําเร็จ");
      } else {
        showDialog("เพิ่มการแจ้งเตือนไม่สําเร็จ: ");
      }
    } catch (error) {
      console.error(
        "Error adding notification:",
        error.message || "Unknown error"
      );
      Alert.alert(
        "Error adding notification",
        error.message || "Unknown error"
      );
    }

    setModalVisible(false);
  };

  const handleDeleteNotification = (noti_id) => {
    Alert.alert(
      "ยืนยันการลบแจ้งเตือน",
      "คุณต้องการลบแจ้งเตือนนี้?",
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ยืนยัน",
          onPress: async () => {
            try {
              const response = await axios.post(
                "http://192.168.50.72/dogcare/deletenoti.php",
                {
                  noti_id,
                }
              );

              if (response.data.success) {
                setNotifications(
                  notifications.filter((noti) => noti.noti_id !== noti_id)
                );
                showDialog("ลบแจ้งเตือนสําเร็จ");
              } else {
                Alert.alert(
                  "Error deleting notification",
                  response.data.message || "Unknown error occurred"
                );
              }
            } catch (error) {
              console.error(
                "Error deleting notification:",
                error.message || "Unknown error"
              );
              Alert.alert(
                "Error deleting notification",
                error.message || "Unknown error"
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleSpecificDaySelection = (day) => {
    if (notiSpecificDays.includes(day)) {
      setNotiSpecificDays(notiSpecificDays.filter((d) => d !== day));
    } else {
      setNotiSpecificDays([...notiSpecificDays, day]);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#FF9090"
        style={styles.loadingIndicator}
      />
    );
  }
  const convertDayToThai = (dayCode) => {
    switch (dayCode) {
      case "Su":
        return "อาทิตย์";
      case "Mo":
        return "จันทร์";
      case "Tu":
        return "อังคาร";
      case "We":
        return "พุธ";
      case "Th":
        return "พฤหัส";
      case "Fr":
        return "ศุกร์";
      case "Sa":
        return "เสาร์";
      default:
        return "";
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>เพิ่มการแจ้งเตือน</Text>
      </TouchableOpacity>

      {notifications.length > 0 ? (
        <ScrollView style={styles.notificationList}>
          {notifications.map((noti, index) => {
            // แปลง noti_day เป็นชื่อวัน
            const formattedDays = noti.noti_day
              ? noti.noti_day.split("|").map(convertDayToThai).join(" ")
              : "";

            return (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>
                  หัวข้อแจ้งเตือน: {noti.noti_name}
                </Text>
                <View style={styles.cardContent}>
                  <Text style={styles.cardText}>
                    รายละเอียดการแจ้งเตือน: {noti.noti_detail}
                  </Text>
                  <Text style={styles.cardText}>เวลา: {noti.noti_time}</Text>

                  {noti.noti_day !== null && formattedDays && (
                    <Text style={styles.cardText}>
                      ทุกๆวัน: {formattedDays}
                    </Text>
                  )}

                  {noti.noti_date !== null && (
                    <Text style={styles.cardText}>
                      วันที่แจ้งเตือน: {formatDate(noti.noti_date)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteNotification(noti.noti_id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.noNotifications}>
          สุนัขของคุณยังไม่มีการแจ้งเตือน
        </Text>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มการแจ้งเตือน</Text>
            <Text style={styles.titlebox}>หัวข้อการแจ้งเตือน :</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={notiName}
              onChangeText={setNotiName}
              placeholderTextColor="#ccc"
            />
            <Text style={styles.titlebox}>รายละเอียดการแจ้งเตือน :</Text>
            <TextInput
              style={styles.input2}
              placeholder=""
              value={notiDetail}
              onChangeText={setNotiDetail}
              placeholderTextColor="#ccc"
              multiline={true}
              numberOfLines={2} // กำหนดเริ่มต้นให้ยาว 2 บรรทัด
            />
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.timeButton}
            >
              <Text style={styles.timeButtonText}>
                เลือกเวลา:{" "}
                {`${notiTime.getHours().toString().padStart(2, "0")}:${notiTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={notiTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    setNotiTime(selectedDate);
                  }
                }}
              />
            )}

            <Text style={styles.titlebox}>เลือกประเภทการแจ้งเตือน:</Text>

            <View style={styles.dayTypeContainer}>
              {["only", "everyday", "specific"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNotiDayType(type)}
                  style={[
                    styles.dayTypeButton,
                    notiDayType === type && styles.selectedDayTypeButton,
                  ]}
                >
                  <Text style={styles.dayTypeButtonText}>
                    {type === "only"
                      ? "ครั้งเดียว"
                      : type === "everyday"
                      ? "ทุกวัน"
                      : "รายวัน"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {notiDayType === "only" && (
              <View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonText}>
                    เลือกวันที่:{" "}
                    {`${notiDate.getDate().toString().padStart(2, "0")}-${(
                      notiDate.getMonth() + 1
                    )
                      .toString()
                      .padStart(2, "0")}-${notiDate.getFullYear()}`}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={notiDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setNotiDate(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            )}
            {notiDayType === "specific" && (
              <View>
                <Text style={styles.modalSubtitle}>เลือกวัน:</Text>
                {dayOptions.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    onPress={() => toggleSpecificDaySelection(day.value)}
                    style={[
                      styles.dayButton,
                      notiSpecificDays.includes(day.value) &&
                        styles.selectedDayButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        notiSpecificDays.includes(day.value) &&
                          styles.selectedDayButtonText,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Save"
                onPress={handleAddNotification}
                color="#FF9090"
              />
              <Button title="Cancel" onPress={handleCancel} color={"red"} />
            </View>
          </View>
        </View>
      </Modal>
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Description>{dialogMessage}</Dialog.Description>
        <Dialog.Button label="ตกลง" onPress={() => setDialogVisible(false)} />
      </Dialog.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#FF9090",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationList: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#FF4d4d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
  },
  noNotifications: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input2: {
    height: 60, // ปรับความสูงให้พอเหมาะกับ 2 บรรทัด
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    
  },
  timeButton: {
    backgroundColor: "#FF9090",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  timeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  dayTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayTypeButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  selectedDayTypeButton: {
    backgroundColor: "#FF9090",
  },
  dayTypeButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  dayButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedDayButton: {
    backgroundColor: "#FF9090",
  },
  dayButtonText: {
    color: "#333",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedDayButtonText: {
    color: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  dateButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#FF9090",
    padding: 10,
    borderRadius: 8,
  },
  titlebox: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default NotiPet;
