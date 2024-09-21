import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const NotiPet = ({ route }) => {
  const { pet_id } = route.params;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notiName, setNotiName] = useState('');
  const [notiTime, setNotiTime] = useState(new Date());
  const [notiDayType, setNotiDayType] = useState('only');
  const [notiSpecificDays, setNotiSpecificDays] = useState([]);
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
        const response = await axios.post('http://192.168.3.15/dogcare/notipet.php', { pet_id });
        if (response.data.success) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching pet notifications:', error.response || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPetNotification();
  }, [pet_id]);

  const handleCancel = () => {
    setModalVisible(false);
    setNotiName('');
    setNotiTime(new Date());
    setNotiDayType('only');
    setNotiSpecificDays([]);
  };
  const handleAddNotification = async () => {
    const formattedTime = `${notiTime.getHours().toString().padStart(2, '0')}:${notiTime.getMinutes().toString().padStart(2, '0')}:00`;
    
    let formattedDay = '';
    if (notiDayType === 'only') {
      formattedDay = 'only';
    } else if (notiDayType === 'everyday') {
      formattedDay = 'S|M|T|W|Th|F|Sa';
    } else {
      formattedDay = notiSpecificDays.join('|');
    }

    try {
      const response = await axios.post('http://192.168.3.15/dogcare/addnoti.php', {
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
              const response = await axios.post('http://192.168.3.15/dogcare/deletenoti.php', {
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

  const toggleSpecificDaySelection = (day) => {
    if (notiSpecificDays.includes(day)) {
      setNotiSpecificDays(notiSpecificDays.filter(d => d !== day));
    } else {
      setNotiSpecificDays([...notiSpecificDays, day]);
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

      {notifications.length > 0 ? (
        <ScrollView style={styles.notificationList}>
          {notifications.map((noti, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>Notification {noti.noti_id}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>Name: {noti.noti_name}</Text>
                <Text style={styles.cardText}>Time: {noti.noti_time}</Text>
                <Text style={styles.cardText}>Date: {noti.noti_day}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteNotification(noti.noti_id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>ลบ</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noNotifications}>สุนัขของคุณยังไม่มีการแจ้งเตือน</Text>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มการแจ้งเตือน</Text>
            <TextInput
              style={styles.input}
              placeholder="Notification Name"
              value={notiName}
              onChangeText={setNotiName}
              placeholderTextColor="#ccc"
            />

            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
              <Text style={styles.timeButtonText}>
                เลือกเวลา: {`${notiTime.getHours().toString().padStart(2, '0')}:${notiTime.getMinutes().toString().padStart(2, '0')}`}
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

            <Text style={styles.modalSubtitle}>เลือกประเภทการแจ้งเตือน:</Text>

            <View style={styles.dayTypeContainer}>
              {['only', 'everyday', 'specific'].map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNotiDayType(type)}
                  style={[styles.dayTypeButton, notiDayType === type && styles.selectedDayTypeButton]}
                >
                  <Text style={styles.dayTypeButtonText}>{type === 'only' ? 'Only once' : type === 'everyday' ? 'Everyday' : 'Specific days'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {notiDayType === 'specific' && (
              <View>
                <Text style={styles.modalSubtitle}>เลือกวัน:</Text>
                {dayOptions.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    onPress={() => toggleSpecificDaySelection(day.value)}
                    style={[styles.dayButton, notiSpecificDays.includes(day.value) && styles.selectedDayButton]}
                  >
                    <Text style={[styles.dayButtonText, notiSpecificDays.includes(day.value) && styles.selectedDayButtonText]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <Button title="Save" onPress={handleAddNotification} color="#FF9090" />
              <Button title="Cancel" onPress={handleCancel} />
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
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationList: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF4d4d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
  },
  noNotifications: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  timeButton: {
    backgroundColor: '#FF9090',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  dayTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayTypeButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  selectedDayTypeButton: {
    backgroundColor: '#FF9090',
  },
  dayTypeButtonText: {
    color: '#333',
  },
  dayButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedDayButton: {
    backgroundColor: '#FF9090',
  },
  dayButtonText: {
    color: '#333',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});

export default NotiPet;
