import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const NotiPet = ({ route }) => {
  const { pet_id } = route.params;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

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
        console.error('Error fetching pet notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetNotification();
  }, [pet_id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#FF9090" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {notifications.length > 0 ? (
        notifications.map((noti, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Notification {noti.noti_id}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Name: {noti.noti_name}</Text>
              <Text style={styles.cardText}>Time: {noti.noti_time}</Text>
              <Text style={styles.cardText}>Date: {noti.noti_day}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noNotifications}>สุนัขของคุณยังไม่มีการแจ้งเตือน</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF9090',
  },
  cardContent: {
    marginTop: 5,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  noNotifications: {
    fontSize: 18,
    color: '#999',
  },
});

export default NotiPet;
