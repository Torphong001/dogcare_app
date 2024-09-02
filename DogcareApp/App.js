import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './component/LoginScreen';
import StepRegisterScreen1 from './component/StepRegisterScreen1';
import StepRegisterScreen2 from './component/StepRegisterScreen2';
import UserInfoScreen from './component/UserInfoScreen';
import BreedScreen from './component/BreedScreen';

const HomeScreen = ({ navigation, userToken }) => {
  return (
    <View style={styles.container}>
      <Button
        title="เข้าสู่ระบบ"
        onPress={() => navigation.navigate('Login')}
      />
      {userToken ? <Text style={styles.tokenText}>Token: {userToken}</Text> : null}
    </View>
  );
};

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const DrawerNavigator = ({ userToken, setUserToken }) => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#FF9090',
        },
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#000000',
      }}
    >
      <Drawer.Screen name="Home">
        {props => <HomeScreen {...props} userToken={userToken} />}
      </Drawer.Screen>
      {userToken ? (
        <>
        <Drawer.Screen
          name="Logout"
          component={() => (
            <View style={styles.container}>
              <Button
                title="ออกจากระบบ"
                onPress={async () => {
                  await AsyncStorage.removeItem('userToken'); // เคลียร์ userToken จาก AsyncStorage
                  setUserToken(null); // เคลียร์ userToken จาก state
                }}
              />
            </View>
          )}
          options={{ title: 'Logout' }}
        />
        <Drawer.Screen name="UserInfo" component={UserInfoScreen} />
        </>
      ) : (
        <Drawer.Screen name="Login" component={LoginScreen} />
      )}
      <Drawer.Screen name="Breed" component={BreedScreen} />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const loadUserToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);
      }
    };

    loadUserToken(); // โหลด token ที่เก็บไว้เมื่อแอปเริ่มทำงาน
  }, []);

  const handleLogin = async (token) => {
    await AsyncStorage.setItem('userToken', token); // บันทึก token ลงใน AsyncStorage
    setUserToken(token); // บันทึก token ลงใน state
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Drawer"
          options={{ headerShown: false }}
        >
          {props => (
            <DrawerNavigator
              {...props}
              userToken={userToken}
              setUserToken={setUserToken}
            />
          )}
        </Stack.Screen>
        {/* Pass handleLogin to LoginScreen */}
        <Stack.Screen name="Login">
          {props => (
            <LoginScreen {...props} handleLogin={handleLogin} />
          )}
        </Stack.Screen>
        <Stack.Screen name="StepRegister1" component={StepRegisterScreen1} />
        <Stack.Screen name="StepRegister2" component={StepRegisterScreen2} />
      </Stack.Navigator>
    </NavigationContainer>
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

export default App;