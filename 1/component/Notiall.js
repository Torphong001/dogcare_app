import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Notiall = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>แจ้งเตือน</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9090',
  },
});

export default Notiall;
