// component/HomeScreen.js
import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';

const SearchScreen = ({ navigation, userToken }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.tokenText}>ค้นหาสายพันธุ์</Text>
      {userToken ? <Text style={styles.tokenText}>Token: {userToken}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333333',
  },
});

export default SearchScreen;
