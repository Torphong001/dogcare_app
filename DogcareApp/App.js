import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from './component/LoginScreen';
import StepRegisterScreen1 from './component/StepRegisterScreen1';
import StepRegisterScreen2 from './component/StepRegisterScreen2';
import UserInfoScreen from './component/UserInfoScreen';
import BreedScreen from './component/BreedScreen';
import HomeScreen from './component/HomeScreen'; // Import HomeScreen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const LogoutScreen = ({ setUserToken }) => (
  <View style={styles.container}>
    <Button
      title="ออกจากระบบ"
      onPress={async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
      }}
    />
  </View>
);

const TabNavigator = ({ userToken, setUserToken }) => {
  return (
    <Tab.Navigator
      initialRouteName="Breed"
      key={userToken}  // ใช้ userToken เป็น key เพื่อบังคับให้รีเรนเดอร์
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Login') {
            iconName = 'log-in';
          } else if (route.name === 'Logout') {
            iconName = 'log-out';
          } else if (route.name === 'UserInfo') {
            iconName = 'person';
          } else if (route.name === 'Breed') {
            iconName = 'paw';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9090',
        tabBarInactiveTintColor: '#000000',
      })}
    >
      <Tab.Screen name="Breed" component={BreedScreen} />
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} userToken={userToken} />}
      </Tab.Screen>
      {userToken ? (
        <>
          <Tab.Screen name="Logout">
            {props => <LogoutScreen {...props} setUserToken={setUserToken} />}
          </Tab.Screen>
          <Tab.Screen name="UserInfo" component={UserInfoScreen} />
        </>
      ) : (
        <Tab.Screen name="Login">
          {props => <LoginScreen {...props} handleLogin={setUserToken} />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
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

    loadUserToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Tab"
          options={{ headerShown: false }}
        >
          {props => (
            <TabNavigator
              {...props}
              userToken={userToken}
              setUserToken={setUserToken}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {props => (
            <LoginScreen {...props} handleLogin={setUserToken} />
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
});

export default App;
