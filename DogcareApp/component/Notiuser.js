import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

const Notiuser = ({ userToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
        
      try {
        const response = await axios.get('http://192.168.3.194/dogcare/getnotiall.php', {
          headers: {
            Authorization: `Bearer ${userToken}` // ส่ง token ผ่าน Authorization header
          }
        });
        
        if (Array.isArray(response.data)) {
          setNotifications(response.data); // เก็บข้อมูลใน state
        } else {
          console.error("Response is not an array:", response.data); // ตรวจสอบข้อมูลที่ได้จาก API
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userToken]);

  const renderNotification = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>ชื่อแจ้งเตือน: {item.noti_name}</Text>
      <Text style={styles.detail}>รหัสสัตว์เลี้ยง: {item.noti_pet_id}</Text>
      <Text style={styles.detail}>เวลา: {item.noti_time}</Text>
      <Text style={styles.detail}>วันที่: {item.noti_day}</Text>
      <Text style={styles.detail}>วันที่: {item.noti_date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF9090" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.noti_id.toString()}
          renderItem={renderNotification}
        />
      ) : (
        <Text style={styles.noDataText}>ไม่มีการแจ้งเตือน</Text> // เพิ่มข้อความแจ้งเตือนหากไม่มีข้อมูล
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#FF9090',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  detail: {
    fontSize: 14,
    color: '#fff',
  },
});

export default Notiuser;
