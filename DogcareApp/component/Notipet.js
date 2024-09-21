import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const NotiPet = ({ route }) => {
  const { pet_id } = route.params;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notiName, setNotiName] = useState('');
  const [notiTime, setNotiTime] = useState(new Date());
  const [notiDay, setNotiDay] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dayOptions = [
    { label: 'Sunday', value: 'S' },
    { label: 'Monday', value: 'M' },
    { label: 'Tuesday', value: 'T' },
    { label: 'Wednesday', value: 'W' },
    { label: 'Thursday', value: 'Th' },
    { label: 'Friday', value: 'F' },
    { label: 'Saturday', value: 'Sa' },
  ];

  useEffect(() => {
    const fetchPetNotification = async () => {
      try {
        const response = await axios.post('http://192.168.3.241/dogcare/notipet.php', { pet_id });
        if (response.data.success) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications([]); // No notifications found
        }
      } catch (error) {
        console.error('Error fetching pet notifications:', error.response || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPetNotification();
  }, [pet_id]);

  const handleAddNotification = async () => {
    const formattedTime = `${notiTime.getHours().toString().padStart(2, '0')}:${notiTime.getMinutes().toString().padStart(2, '0')}:00`;
    const formattedDay = notiDay.join('|');
  
    try {
      const response = await axios.post('http://192.168.3.241/dogcare/addnoti.php', {
        noti_name: notiName,
        noti_time: formattedTime,
        noti_day: formattedDay,
        noti_pet_id: pet_id,
      });
  
      if (response.data.success) {
        setNotifications([...notifications, { noti_name: notiName, noti_time: formattedTime, noti_day: formattedDay }]);
        Alert.alert('Notification added successfully!');
      } else {
        Alert.alert('Error adding notification', response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error adding notification:', error.message || 'Unknown error');
      Alert.alert('Error adding notification', error.message || 'Unknown error');
    }
  
    setModalVisible(false);
  };
  
  const handleDeleteNotification = (noti_id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await axios.post('http://192.168.3.241/dogcare/deletenoti.php', {
                noti_id,
              });
  
              if (response.data.success) {
                setNotifications(notifications.filter(noti => noti.noti_id !== noti_id));
                Alert.alert('Notification deleted successfully!');
              } else {
                Alert.alert('Error deleting notification', response.data.message || 'Unknown error occurred');
              }
            } catch (error) {
              console.error('Error deleting notification:', error.message || 'Unknown error');
              Alert.alert('Error deleting notification', error.message || 'Unknown error');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleDaySelection = (day) => {
    if (notiDay.includes(day)) {
      setNotiDay(notiDay.filter(d => d !== day));
    } else {
      setNotiDay([...notiDay, day]);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF9090" style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>เพิ่มการแจ้งเตือน</Text>
      </TouchableOpacity>

      {/* List of notifications */}
      {notifications.length > 0 ? (
        notifications.map((noti, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Notification {noti.noti_id}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Name: {noti.noti_name}</Text>
              <Text style={styles.cardText}>Time: {noti.noti_time}</Text>
              <Text style={styles.cardText}>Date: {noti.noti_day}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteNotification(noti.noti_id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>ลบ</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noNotifications}>สุนัขของคุณยังไม่มีการแจ้งเตือน</Text>
      )}

      {/* Modal for adding notification */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มการแจ้งเตือน</Text>
            <TextInput
              style={styles.input}
              placeholder="Notification Name"
              value={notiName}
              onChangeText={setNotiName}
            />

            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
              <Text style={styles.timeButtonText}>{`เลือกเวลา: ${notiTime.getHours().toString().padStart(2, '0')}:${notiTime.getMinutes().toString().padStart(2, '0')}`}</Text>
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

            <Text style={styles.modalSubtitle}>เลือกวัน:</Text>
            {dayOptions.map((day) => (
              <TouchableOpacity
                key={day.value}
                onPress={() => toggleDaySelection(day.value)}
                style={[
                  styles.dayButton,
                  notiDay.includes(day.value) && styles.selectedDayButton,
                ]}
              >
                <Text style={styles.dayButtonText}>{day.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <Button title="ยกเลิก" onPress={() => setModalVisible(false)} color="#FF9090" />
              <Button title="เพิ่ม" onPress={handleAddNotification} color="#FF9090" />
            </View>
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
    backgroundColor: '#f9f9f9',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#FF9090',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF7F7F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noNotifications: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  timeButton: {
    padding: 10,
    backgroundColor: '#FF9090',
    borderRadius: 5,
    marginBottom: 15,
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dayButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    margin: 5,
  },
  selectedDayButton: {
    backgroundColor: '#FF9090',
  },
  dayButtonText: {
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default NotiPet;
