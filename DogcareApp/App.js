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
import Notipet from './component/Notipet';

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
        options={{ 
          tabBarLabel: 'ข้อมูลสุนัข',
          title: 'ข้อมูลสุนัข',
        headerTitleAlign: 'center', // Center the title
        headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
        headerTintColor: '#fff', // 
        headerTitleStyle: { fontWeight: 'bold' }
        }} // Thai label for BreedScreen
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
            options={{ 
              tabBarLabel: 'สัตว์เลี้ยงของฉัน',
              title: 'สัตว์เลี้ยงของฉัน',
            headerTitleAlign: 'center', // Center the title
            headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
            headerTintColor: '#fff', // 
            headerTitleStyle: { fontWeight: 'bold' }
            }} 
          >
            {props => <MypetScreen {...props} userToken={userToken} />}
          </Tab.Screen>
          <Tab.Screen
            name="UserInfo"
            options={{ 
              tabBarLabel: 'ข้อมูลผู้ใช้',
              title: 'ข้อมูลผู้ใช้',
            headerTitleAlign: 'center', // Center the title
            headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
            headerTintColor: '#fff', // 
            headerTitleStyle: { fontWeight: 'bold' }
            }} // Thai label for UserInfoScreen
          >
            {props => <UserInfoScreen {...props} setUserToken={setUserToken} />}
          </Tab.Screen>
        </>
      ) : (
        <Tab.Screen
          name="Login"
          options={{ 
            tabBarLabel: 'หน้าล็อคอิน', // Thai label for LoginScreen
            title: false,
            headerTitleAlign: 'center', // Center the title
            headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
            headerTintColor: '#fff', //
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
        <Stack.Screen name="Login" >
          {props => (
            <LoginScreen {...props} handleLogin={setUserToken} />
          )}
        </Stack.Screen>
        <Stack.Screen name="StepRegister1" component={StepRegisterScreen1} 
        options={{ 
          tabBarLabel: 'สมัครสมาชิก',
          title: 'สมัครสมาชิก',
        headerTitleAlign: 'center', // Center the title
        headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
        headerTintColor: '#fff', // 
        headerTitleStyle: { fontWeight: 'bold' }
        }}/>
        <Stack.Screen name="StepRegister2" component={StepRegisterScreen2} 
        options={{ 
          tabBarLabel: 'สมัครสมาชิก',
          title: 'สมัครสมาชิก',
        headerTitleAlign: 'center', // Center the title
        headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
        headerTintColor: '#fff', // 
        headerTitleStyle: { fontWeight: 'bold' }
        }}/>
        <Stack.Screen name="AddPetScreen"
        options={{ 
          tabBarLabel: 'เพิ่มสุนัข',
          title: 'เพิ่มสุนัข',
        headerTitleAlign: 'center', // Center the title
        headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
        headerTintColor: '#fff', // 
        headerTitleStyle: { fontWeight: 'bold' }
        }}>
          {props => <AddPetScreen {...props} userToken={userToken} />}
        </Stack.Screen>
        <Stack.Screen name="MyPetInfo" component={MyPetInfo} 
        options={{ 
          tabBarLabel: 'ข้อมูลสุนัข',
          title: 'ข้อมูลสุนัข',
        headerTitleAlign: 'center', // Center the title
        headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
        headerTintColor: '#fff', // 
        headerTitleStyle: { fontWeight: 'bold' }
        }} />
        <Stack.Screen name="Notipet" component={Notipet} 
        options={{ 
          tabBarLabel: 'การแจ้งเตือน',
          title: 'การแจ้งเตือน',
        headerTitleAlign: 'center', // Center the title
        headerStyle: { backgroundColor: '#FF9090' }, // Set header background color
        headerTintColor: '#fff', // 
        headerTitleStyle: { fontWeight: 'bold' }
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
