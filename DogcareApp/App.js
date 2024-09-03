import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './component/LoginScreen';
import StepRegisterScreen1 from './component/StepRegisterScreen1';
import StepRegisterScreen2 from './component/StepRegisterScreen2';
import UserInfoScreen from './component/UserInfoScreen';
import BreedScreen from './component/BreedScreen';
import SearchScreen from './component/SearchScreen';
import MypetScreen from './component/MypetScreen';
import AddPetScreen from './component/AddPetScreen';
import MyPetInfo from './component/MyPetInfo';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ userToken, setUserToken }) => {
  return (
    <Tab.Navigator
      initialRouteName="Breed"
      key={userToken}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Login') {
            iconName = 'log-in';
          } else if (route.name === 'UserInfo') {
            iconName = 'person';
          } else if (route.name === 'Breed' || route.name === 'Mypet') {
            iconName = 'paw';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9090',
        tabBarInactiveTintColor: '#000000',
      })}
    >
      <Tab.Screen
        name="Breed"
        component={BreedScreen}
        options={{ tabBarLabel: 'พันธุ์สุนัข' }} // Thai label for BreedScreen
      />
      <Tab.Screen
        name="Search"
        options={{ tabBarLabel: 'ค้นหา' }} // Thai label for SearchScreen
      >
        {props => <SearchScreen {...props} userToken={userToken} />}
      </Tab.Screen>

      {userToken ? (
        <>
          <Tab.Screen
            name="Mypet"
            options={{ tabBarLabel: 'สัตว์เลี้ยงของฉัน' }} // Thai label for MypetScreen
          >
            {props => <MypetScreen {...props} userToken={userToken} />}
          </Tab.Screen>
          <Tab.Screen
            name="UserInfo"
            options={{ tabBarLabel: 'ข้อมูลผู้ใช้' }} // Thai label for UserInfoScreen
          >
            {props => <UserInfoScreen {...props} setUserToken={setUserToken} />}
          </Tab.Screen>
        </>
      ) : (
        <Tab.Screen
          name="Login"
          options={{ 
            tabBarLabel: 'หน้าล็อคอิน', // Thai label for LoginScreen
            label: null,
          }}
        >
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
        <Stack.Screen name="AddPetScreen">
          {props => <AddPetScreen {...props} userToken={userToken} />}
        </Stack.Screen>
        <Stack.Screen name="MypetScreen" component={MypetScreen} />
        <Stack.Screen name="MyPetInfo" component={MyPetInfo} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
