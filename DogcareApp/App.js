import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./component/LoginScreen";
import StepRegisterScreen1 from "./component/StepRegisterScreen1";
import StepRegisterScreen2 from "./component/StepRegisterScreen2";
import UserInfoScreen from "./component/UserInfoScreen";
import BreedScreen from "./component/BreedScreen";
import SearchScreen from "./component/SearchScreen";
import MypetScreen from "./component/MypetScreen";
import AddPetScreen from "./component/AddPetScreen";
import MyPetInfo from "./component/MyPetInfo";
import Notipet from "./component/Notipet";
import Notiuser from "./component/Notiuser";
import TestWebView from "./component/TestWebView";
import axios from 'axios';
import Toast from 'react-native-toast-message'; // นำเข้า Toast




const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [userToken, setUserToken] = useState(null);
  
  useEffect(() => {
    const loadUserToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setUserToken(token);
      }
    };
  
    loadUserToken();  // เรียกใช้ loadUserToken เมื่อ component ถูก mount
  }, []);
  
  useEffect(() => {
    const fetchNotifications = async (token) => {
      try {
          const response = await axios.get('http://192.168.3.82/dogcare/getnotiall.php', {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });
          if (Array.isArray(response.data)) {
            // ตรวจสอบแต่ละ notification
            setNotifications(response.data);
              response.data.forEach(async (notification) => {
                  if (notification.noti_status === null) {
                      Toast.show({
                          text1: `Notification ID: ${notification.noti_id}`, // แสดงข้อความ
                          position: 'top',
                          type: 'info',
                      });
  
                      // ส่งข้อความไปยัง LINE
                      await sendLineNotification(userToken,notification);
  
                      // อัปเดต noti_status เป็น F
                      await axios.post('http://192.168.3.82/dogcare/updatenoti.php', {
                          noti_id: notification.noti_id,
                          noti_status: 'F',
                      });
                  }
              });
          }
      } catch (error) {
          console.error('Error fetching notifications:', error);
      }
  };

    if (userToken) {
        fetchNotifications(userToken);

        const intervalId = setInterval(() => {
            fetchNotifications(userToken);
        }, 5000);

        return () => clearInterval(intervalId);
    }
}, [userToken]);
  
const sendLineNotification = async (userToken, notification) => {
  try {
      // Fetch user_id_line from your API
      const userInfoResponse = await axios.get("http://192.168.3.82/dogcare/getuser_lineid.php", {
          headers: {
              Authorization: `Bearer ${userToken}`
          }
      });

      // Check if user_id_line exists in the response
      const userIdLine = userInfoResponse.data.user_id_line;
      if (!userIdLine) {
          console.error("User ID Line not found");
          return;
      }
      console.log(notification.noti_pet_id)
      // Fetch pet details using the notification's pet ID
      const petResponse = await axios.get(`http://192.168.3.82/dogcare/getpetnameline.php?pet_id=${notification.noti_pet_id}`);
      const pet = petResponse.data;

      console.log(pet)

      // Prepare the message
      const messageText = `แจ้งเตือน\nชื่อแจ้งเตือน: ${notification.noti_name}\nชื่อสุนัข: ${pet.pet_name}\nชื่อสุนัข: ${notification.noti_detail}`;

      // Send the LINE notification
      const response = await axios.post(
          "https://api.line.me/v2/bot/message/push",
          {
              to: userIdLine, // Use the fetched user_id_line
              messages: [
                  {
                      type: "text",
                      text: messageText, // Use the prepared message
                  },
              ],
          },
          {
              headers: {
                  Authorization: `Bearer fjUF82T60ul2cmiParfa3qAhU3HzLaqVP+Hw6ToHp/kw7y8dvEnZuKcL4++F7sPm4R2BBB2hYdP1LvQPFHSlPAGswlzwAJ/Br7BQ8g5jU/PbHDRjcubx592eNL9mZOwK9GO43UeS7Rs2vYRPEe5jfgdB04t89/1O/w1cDnyilFU=`, // Use the correct Channel Access Token
                  "Content-Type": "application/json",
              },
          }
      );

      console.log('Message sent successfully:', response.data);
  } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
};

  

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tab" options={{ headerShown: false }}>
          {(props) => (
            <TabNavigator
              {...props}
              userToken={userToken}
              setUserToken={setUserToken}
              notifications={notifications}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} handleLogin={setUserToken} />}
        </Stack.Screen>
        <Stack.Screen name="Notiuser" 
          options={{
            title: "แจ้งเตือนทั้งหมดของวันนี้",
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          {(props) => <Notiuser {...props} notifications={notifications}/>}
        </Stack.Screen>
        <Stack.Screen
          name="StepRegister1"
          component={StepRegisterScreen1}
          options={{
            tabBarLabel: "สมัครสมาชิก",
            title: "สมัครสมาชิกขั้นตอนที่1",
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="StepRegister2"
          component={StepRegisterScreen2}
          options={{
            tabBarLabel: "สมัครสมาชิก",
            title: "สมัครสมาชิกขั้นตอนที่2",
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="AddPetScreen"
          options={{
            tabBarLabel: "เพิ่มสุนัข",
            title: "เพิ่มสุนัข",
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          {(props) => <AddPetScreen {...props} userToken={userToken} />}
        </Stack.Screen>
        <Stack.Screen
          name="MyPetInfo"
          component={MyPetInfo}
          options={{
            tabBarLabel: "ข้อมูลสุนัข",
            title: "ข้อมูลสุนัข",
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <Stack.Screen
          name="Notipet"
          component={Notipet}
          options={{
            tabBarLabel: "การแจ้งเตือน",
            title: "การแจ้งเตือน",
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
      </Stack.Navigator>
      <Toast ref={Toast.setRef} />
    </NavigationContainer>
  );
};

const TabNavigator = ({ userToken, setUserToken, notifications }) => {
  return (
    <Tab.Navigator
      initialRouteName="Breed"
      key={userToken}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Search") {
            iconName = "search";
          } else if (route.name === "Login") {
            iconName = "log-in";
          } else if (route.name === "UserInfo") {
            iconName = "person";
          } else if (route.name === "Breed" || route.name === "Mypet") {
            iconName = "paw";
          } else if (route.name === "TestWebView") {
            iconName = "chatbubble";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF9090",
        tabBarInactiveTintColor: "#000000",
      })}
    >
      <Tab.Screen
        name="Breed"
        component={BreedScreen}
        options={{
          tabBarLabel: "ข้อมูลสุนัข",
          title: "Dogcare",
          headerTitleAlign: "center", // Center the title
          headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
          headerTintColor: "#fff", //
          headerTitleStyle: { fontWeight: "bold" },
        }} // Thai label for BreedScreen
      />
      
      <Tab.Screen
        name="Search"
        options={{ 
          tabBarLabel: "ค้นหาสายพันธุ์" ,
          title: "ค้นหาสายพันธุ์สุนัข",
          headerTitleAlign: "center", // Center the title
          headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
          headerTintColor: "#fff", //
          headerTitleStyle: { fontWeight: "bold" },
        }} // Thai label for SearchScreen
      >
        {(props) => <SearchScreen {...props} userToken={userToken} />}
      </Tab.Screen>

      {userToken ? (
        <>
          <Tab.Screen
            name="Mypet"
            options={({ navigation }) => ({
              tabBarLabel: "สัตว์เลี้ยงของฉัน",
              title: "สัตว์เลี้ยงของฉัน",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
              headerTintColor: "#fff", // Set header text color
              headerTitleStyle: { fontWeight: "bold" },
              // เพิ่มไอคอนกระดิ่งแจ้งเตือน
      
            })}
          >
            {(props) => <MypetScreen {...props} userToken={userToken} notifications={notifications}/>}
          </Tab.Screen>
          <Tab.Screen
        name="TestWebView"
        component={TestWebView}
        options={{
          tabBarLabel: "แชทกับบอท",
          title: "แชทกับบอท",
          headerTitleAlign: "center", // Center the title
          headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
          headerTintColor: "#fff", //
          headerTitleStyle: { fontWeight: "bold" },
        }} // Thai label for BreedScreen
      />
          <Tab.Screen
            name="UserInfo"
            options={{
              tabBarLabel: "ข้อมูลผู้ใช้",
              title: "ข้อมูลผู้ใช้",
              headerTitleAlign: "center", // Center the title
              headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
              headerTintColor: "#fff", //
              headerTitleStyle: { fontWeight: "bold" },
            }} // Thai label for UserInfoScreen
          >
            {(props) => (
              <UserInfoScreen {...props} setUserToken={setUserToken} />
            )}
          </Tab.Screen>
        </>
      ) : (
        <Tab.Screen
          name="Login"
          options={{
            tabBarLabel: "หน้าล็อคอิน", // Thai label for LoginScreen
            title: false,
            headerTitleAlign: "center", // Center the title
            headerStyle: { backgroundColor: "#FF9090" }, // Set header background color
            headerTintColor: "#fff", //
          }}
        >
          {(props) => <LoginScreen {...props} handleLogin={setUserToken} />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
};
export default App;
