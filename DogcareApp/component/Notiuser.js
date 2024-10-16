import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const Notiuser = ({ notifications }) => {
  const formatTextWithNewLine = (text) => {
    // ตรวจสอบว่า text เป็น undefined หรือไม่ ถ้าเป็น ให้ส่งกลับเป็น Text ว่าง
    if (!text) {
      return <Text></Text>;
    }

    const lines = text.split("|");
    return lines.map((line, index) => (
      <Text key={index}>
        {line.trim()} {/* ตัดช่องว่างซ้ายและขวา */}
        {index < lines.length - 1 && <Text>{' '}</Text>} {/* เพิ่มช่องว่าง */}
      </Text>
    ));
  };

  const convertDayToThai = (dayCode) => {
    switch (dayCode) {
      case 'Su':
        return 'อาทิตย์';
      case 'Mo':
        return 'จันทร์';
      case 'Tu':
        return 'อังคาร';
      case 'We':
        return 'พุธ';
      case 'Th':
        return 'พฤหัส';
      case 'Fr':
        return 'ศุกร์';
      case 'Sa':
        return 'เสาร์';
      default:
        return '';
    }
  };

  const renderNotification = ({ item }) => {
    // แปลง noti_day เป็นชื่อวัน
    const formattedDays = item.noti_day
      ? item.noti_day.split('|').map(convertDayToThai).join(' ') // แปลงวันและเชื่อมด้วยช่องว่าง
      : '';
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      };
    return (
      <View style={styles.card}>
        <Text style={styles.title}>ชื่อแจ้งเตือน: {item.noti_name}</Text>
        <Text style={styles.detail}>รหัสสัตว์เลี้ยง: {item.noti_pet_id}</Text>
        <Text style={styles.detail}>เวลา: {item.noti_time}</Text>
        <Text style={styles.detail}>ทุกๆวัน: {formattedDays}</Text> 
        {item.noti_date && ( // ไม่ทำอะไรกับ noti_date
          <Text style={styles.detail}>วันที่: {formatDate(item.noti_date)}</Text>
        )}
      </View>
    );
  };

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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

export default Notiuser;
