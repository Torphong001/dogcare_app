import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

const MypetScreen = ({ navigation, userToken }) => {
  const [userInfo, setUserInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://192.168.3.180/dogcare/getpets.php', {
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MyPetInfo', { pet: item })}
    >
      {item.pet_pic ? (
        <Image source={{ uri: item.pet_pic }} style={styles.image} />
      ) : (
        <FontAwesome name="user" size={100} color="gray" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.petName}>{item.pet_name}</Text>
        <Text style={styles.petBreed}>สายพันธุ์: {item.breed_name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
});

export default MypetScreen;
