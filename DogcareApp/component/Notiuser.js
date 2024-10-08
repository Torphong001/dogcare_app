import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
const Notiuser = ({ notifications }) => {
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
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.noti_id.toString()}
          renderItem={renderNotification}
        />
      ) : (
        <Text style={styles.noDataText}>ไม่มีการแจ้งเตือน</Text>
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
