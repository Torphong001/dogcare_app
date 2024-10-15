import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const MypetScreen = ({ navigation, userToken, notifications }) => {
  const [userInfo, setUserInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://192.168.3.82/dogcare/getpets.php', {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.data.error) {
          console.error(response.data.error);
        } else {
          setUserInfo(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchUserInfo();
    }
  }, [isFocused, userToken]);
  const handlePress = async () => {
    await handleChange(); // เรียกฟังก์ชันเพื่ออัปเดตสถานะ notification
    navigation.navigate('Notiuser'); // นำทางไปยังหน้าที่ต้องการ
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MyPetInfo', { pet: item })}
    >
      {item.pet_pic ? (
        <Image source={{ uri: `http://192.168.3.82/dogcare/uploads/${item.pet_pic}` }} style={styles.image} />
      ) : (
        <FontAwesome name="user" size={100} color="gray" />
      )}
      <View style={styles.textContainer}>
        {/* ห่อหุ้มข้อความด้วย <Text> component */}
        <Text style={styles.petName}>{item.pet_name}</Text>
        <Text style={styles.petBreed}>สายพันธุ์: {item.breed_name}</Text>
      </View>
    </TouchableOpacity>
  );
  const handleChange = async () => {
    if (hasNotifications) {
    try {
      // สร้าง array ของ promises สำหรับการอัปเดตแต่ละ notification
      const updatePromises = notifications.map(async (notification) => {
        return await axios.post('http://192.168.3.82/dogcare/updatenoti.php', {
          noti_id: notification.noti_id, // ส่ง noti_id เพื่ออัปเดต
          noti_status: 'R', // อัปเดตสถานะเป็น 'R'
        });
      });
  
      // รอให้ทุกการอัปเดตเสร็จสิ้น
      await Promise.all(updatePromises);
      console.log('Notifications updated successfully');
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };
  }
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // เช็คว่ามีการแจ้งเตือนที่ noti_status ไม่เป็น null หรือไม่
  const hasNotifications = notifications && notifications.some(noti => noti.noti_status == 'F');

  return (
    <View style={styles.container}>
      <FlatList
        data={[...userInfo, { addNew: true }]}
        renderItem={({ item }) =>
          item.addNew ? (
            <TouchableOpacity
              style={[styles.card, styles.addCard]}
              onPress={() => navigation.navigate('AddPetScreen')}
            >
              <Ionicons name="add-circle-outline" size={50} color="#FF9090" />
            </TouchableOpacity>
          ) : (
            renderItem({ item })
          )
        }
        keyExtractor={(item, index) => index.toString()}
      />

      {/* ไอคอนที่อยู่มุมขวาล่าง */}
      <TouchableOpacity style={styles.notificationIcon} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={25} color="#fff"  />
          {hasNotifications && <View style={styles.redDot} />} 
        </View>
      </TouchableOpacity>
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
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  petBreed: {
    marginTop: 5,
    fontSize: 14,
    color: 'gray',
  },
  notificationIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  iconContainer: {
    backgroundColor: '#FF9090', // สีพื้นหลังของไอคอน
    borderRadius: 30, // ทำให้ไอคอนกลม
    padding: 10, // เพิ่ม padding เพื่อให้มีระยะห่าง
  },
  redDot: {
    position: 'absolute',
    right: 11,
    top: 10,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
});

export default MypetScreen;
